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

  // Borrar intentos de un usuario específico (y opcionalmente para un examen específico)
  const query = supabase.from('exam_attempts').delete().eq('user_id', userId)
  
  if (examId) {
    query.eq('exam_id', examId)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: 'Error al resetear intentos' }, { status: 500 })
  }

  // También borramos los certificados asociados si los hubiera
  await supabase.from('certificates').delete().eq('user_id', userId)

  return NextResponse.json({ success: true, message: 'Intentos reseteados correctamente' })
}
