import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params
  const { attemptId, answers } = await request.json()
  
  const supabase = supabaseAdmin

  // 1. Obtener el intento
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('*, exams(question_count, pass_score_percent, program_id)')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    return NextResponse.json({ error: 'Intento no encontrado' }, { status: 404 })
  }

  if (attempt.status !== 'in_progress' && attempt.status !== 'completed') {
     // Permitimos seguir si es 'completed' solo por si hubo una re-entrega por error de red
     // pero idealmente 'in_progress'. 
  }

  // 2. Obtener preguntas correctas
  const { data: questions, error: questionsError } = await supabase
    .from('exam_questions')
    .select('id, correct_answer')
    .eq('exam_id', examId)

  if (questionsError || !questions) {
    return NextResponse.json({ error: 'Error al cargar preguntas' }, { status: 500 })
  }

  // 3. Procesar respuestas
  let finalResponsesMap: Record<string, number> = {}
  
  if (answers && typeof answers === 'object') {
    // Si se enviaron por body, normalizamos a Record<UUID, number>
    Object.entries(answers).forEach(([qId, val]) => {
      finalResponsesMap[qId] = Number(val)
    })
  }

  // 4. Calcular puntuación y guardar respuestas de forma óptima por lotes
  let score = 0
  const totalQuestions = attempt.exams.question_count || 30
  const questionIds = Object.keys(finalResponsesMap)
  const responseInserts = []

  for (const qId of questionIds) {
    const userAnswer = finalResponsesMap[qId]
    const dbQuestion = questions.find(q => q.id === qId)
    
    if (!dbQuestion) continue 

    const isCorrect = userAnswer === Number(dbQuestion.correct_answer)
    if (isCorrect) score++

    responseInserts.push({
      attempt_id: attemptId,
      question_id: qId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString()
    })
  }

  // Guardado masivo en una sola petición (Aprovechando la restricción UNIQUE que añadimos)
  if (responseInserts.length > 0) {
    const { error: upsertError } = await supabase
      .from('exam_responses')
      .upsert(responseInserts, { onConflict: 'attempt_id,question_id' })
    
    if (upsertError) {
      console.error('Error batch upserting responses:', upsertError)
      return NextResponse.json({ error: 'Error al procesar respuestas' }, { status: 500 })
    }
  }

  const scorePercent = (score / totalQuestions) * 100
  const passed = scorePercent >= (attempt.exams.pass_score_percent || 80)

  // 5. Finalizar el intento
  const { error: updateError } = await supabase
    .from('exam_attempts')
    .update({
      score,
      passed,
      status: 'completed',
      finished_at: new Date().toISOString()
    })
    .eq('id', attemptId)

  if (updateError) {
    return NextResponse.json({ error: 'Error al actualizar el resultado' }, { status: 500 })
  }

  // 6. Certificado
  if (passed) {
    const certificateCode = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    try {
      await supabase
        .from('certificates')
        .insert({
          user_id: attempt.user_id,
          program_id: attempt.exams.program_id,
          exam_attempt_id: attemptId,
          certificate_code: certificateCode
        })
    } catch (e) {
      console.error('Error generating certificate:', e)
    }
  }

  return NextResponse.json({ success: true, score, passed, scorePercent })
}
