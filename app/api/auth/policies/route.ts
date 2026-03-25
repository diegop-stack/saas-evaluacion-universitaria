import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = supabaseAdmin

  // Actualizamos el perfil para marcar que ha aceptado las políticas
  const { error } = await supabase
    .from('profiles')
    .update({ 
        accepted_policies: true,
        policies_accepted_at: new Date().toISOString()
    })
    .ilike('email', session.email)

  if (error) {
    console.error('Error al aceptar políticas:', error)
    return NextResponse.json({ error: 'Error al registrar la aceptación.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
