import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'

export async function getExamData(examId: string) {
  const session = await getSession()
  if (!session) throw new Error('No autorizado')

  // Usamos supabaseAdmin para todo el flujo de carga porque RLS bloquearía el acceso anónimo
  const supabase = supabaseAdmin

  // Obtener perfil por email de la sesión
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', session.email)
    .single()

  if (!profile) throw new Error('Perfil no encontrado')

  // 1. Verificar si el examen existe y está activo
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('*, exam_windows(*)')
    .eq('id', examId)
    .eq('is_active', true)
    .single()

  if (examError || !exam) throw new Error('Examen no encontrado')

  // 2. Verificar ventana temporal
  const now = new Date()
  const window = exam.exam_windows?.[0]
  if (window) {
    const opensAt = new Date(window.opens_at)
    const closesAt = new Date(window.closes_at)
    if (now < opensAt || now > closesAt) {
      throw new Error('La ventana del examen está cerrada')
    }
  }

  // 3. Verificar intentos previos
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', profile.id)
    .eq('exam_id', examId)
    .order('created_at', { ascending: false })

  // 3.1 Verificar si ya hay un intento en curso para este examen (para permitir refrescar)
  const activeAttempt = attempts?.find(a => a.status === 'in_progress')
  
  if (activeAttempt) {
    // Si hay uno activo, lo reanudamos cargando las preguntas que ya tenía
    const { data: currentQuestions } = await supabase
      .from('exam_questions')
      .select('id, question_text, options, category')
      .eq('exam_id', examId)

    // Nota: Para ser 100% exactos deberíamos guardar qué preguntas se le asignaron al azar.
    // Como simplificación para el MVP, si refresca le damos las mismas o un nuevo set de 30 del pool, 
    // pero mantenemos el mismo ID de intento.
    // Idealmente, las respuestas guardadas el en DB (exam_responses) dictarán cuáles mostrar.
    
    // Filtramos para obtener las preguntas que ya respondió + algunas nuevas si faltan 
    // (pero por ahora simplemente cargamos el pool de nuevo)
    const { data: responses } = await supabase
      .from('exam_responses')
      .select('question_id')
      .eq('attempt_id', activeAttempt.id)

    const answeredIds = new Set(responses?.map(r => r.question_id) || [])
    
    // Barajar asumiendo que el pool es mayor que question_count
    // Para no cambiar las preguntas a mitad del examen, intentamos que las respondidas estén incluidas
    const { data: questions } = await supabase
      .from('exam_questions')
      .select('id, question_text, options, category')
      .eq('exam_id', examId)

    if (!questions) throw new Error('Error al cargar preguntas')

    const shuffledQuestions = questions
      .sort(() => (answeredIds.has(questions[0].id) ? -1 : Math.random() - 0.5)) // Priorizar respondidas
      .slice(0, exam.question_count)
    
    return {
      exam,
      attempt: activeAttempt,
      questions: shuffledQuestions,
    }
  }

  // 4. Si no hay activo, verificar límite de 3 intentos y REGLA DE COOLDOWN DE 24H
  if (attempts && attempts.length >= 3) {
    throw new Error('Has agotado el límite de 3 intentos para este examen')
  }

  // El cooldown solo aplica si el último intento fue completado o anulado
  const lastFinishedAttempt = attempts?.find(a => a.status === 'completed' || a.status === 'annulled')
  if (lastFinishedAttempt) {
    const cooldownPeriod = 24 * 60 * 60 * 1000 // 24h
    const timeSinceLast = now.getTime() - new Date(lastFinishedAttempt.created_at).getTime()
    if (timeSinceLast < cooldownPeriod) {
      const remaining = Math.ceil((cooldownPeriod - timeSinceLast) / (60 * 60 * 1000))
      throw new Error(`Debes esperar ${remaining} horas antes de tu próximo intento`)
    }
  }

  // 5. Crear nuevo intento si todo lo anterior pasó
  const attemptNumber = (attempts?.length || 0) + 1
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .insert({
      user_id: profile.id,
      exam_id: examId,
      attempt_number: attemptNumber,
      total_questions: exam.question_count,
      status: 'in_progress',
    })
    .select()
    .single()

  if (attemptError) throw new Error('Error al iniciar el intento de examen')

  // 5. Obtener preguntas (usando service_role para bypass RLS)
  // Nota: En un entorno real, esto se haría via Edge Function o con un cliente service_role
  // Aquí usamos el cliente de servidor normal porque asumimos que tenemos las variables correctas
  // Pero según las reglas, no hay SELECT policy para usuarios normales.
  // Re-conectamos con service_role si es necesario en producción.
  
  const { data: questions, error: questionsError } = await supabase
    .from('exam_questions')
    .select('id, question_text, options, category')
    .eq('exam_id', examId)

  if (questionsError || !questions) throw new Error('Error al cargar preguntas')

  // 6. Barajar preguntas y seleccionar la cantidad configurada (ej. 30 de un pool de 40)
  const shuffledQuestions = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, exam.question_count)
    .map(q => ({
      ...q,
      options: q.options as string[]
    }))

  return {
    exam,
    attempt,
    questions: shuffledQuestions,
  }
}
