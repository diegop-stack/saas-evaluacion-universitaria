import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getSession()
  
  // Guard de Email de admin
  const userEmail = session?.email?.toLowerCase() || ''
  const isAuthorizedEmail = userEmail.includes('learningheroes.com') || userEmail.includes('admin')

  if (!isAuthorizedEmail) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { userId, examId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
  }

  const supabase = supabaseAdmin

  try {
    // 1. Obtener los IDs de los intentos a borrar
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('id')
      .eq('user_id', userId)

    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map(a => a.id)

      // 1. Borrar respuestas asociadas
      await supabase
        .from('exam_responses')
        .delete()
        .in('attempt_id', attemptIds)

      // 2. Borrar certificados asociados (IMPORTANTE: Antes que el intento)
      await supabase
        .from('certificates')
        .delete()
        .in('exam_attempt_id', attemptIds)

      // 3. Borrar intentos
      const { error: deleteError } = await supabase
        .from('exam_attempts')
        .delete()
        .in('id', attemptIds)

      if (deleteError) {
        console.error('FAILED TO DELETE ATTEMPTS:', deleteError)
        throw deleteError
      }
    }

    // 4. Borrar cualquier otro certificado suelto por user_id
    await supabase.from('certificates').delete().eq('user_id', userId)

    return NextResponse.json({ success: true, message: 'Expediente reseteado correctamente' })
  } catch (error: any) {
    console.error('FULL ERROR LOG IN ADMIN RESET:', error)
    return NextResponse.json({ 
      error: `Fallo Crítico: ${error.message || 'Error Desconocido'}` 
    }, { status: 500 })
  }
}
