import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = await createClient()

  // Actualizamos el perfil para marcar que ha aceptado las políticas
  const { error } = await supabase
    .from('profiles')
    .update({ 
        accepted_policies: true,
        policies_accepted_at: new Date().toISOString()
    })
    .eq('email', session.email)

  if (error) {
    console.error('Error al aceptar políticas:', error)
    return NextResponse.json({ error: 'Error al registrar la aceptación.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
