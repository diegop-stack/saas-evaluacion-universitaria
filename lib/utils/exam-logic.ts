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
    .eq('email', session.email)
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

  // 3. Verificar intentos y cooldown
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', profile.id)
    .eq('exam_id', examId)
    .order('created_at', { ascending: false })

  if (attempts && attempts.length >= 3) {
    throw new Error('Has agotado el límite de 3 intentos para este examen')
  }

  if (attempts && attempts.length > 0) {
    const lastAttempt = attempts[0]
    const cooldownPeriod = 24 * 60 * 60 * 1000 // 24h
    const timeSinceLast = now.getTime() - new Date(lastAttempt.created_at).getTime()
    if (timeSinceLast < cooldownPeriod) {
      const remaining = Math.ceil((cooldownPeriod - timeSinceLast) / (60 * 60 * 1000))
      throw new Error(`Debes esperar ${remaining} horas antes de tu próximo intento`)
    }
  }

  // 4. Crear intento
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
