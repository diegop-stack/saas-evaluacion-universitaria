import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession, setSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { fullName, nationality, dni } = await request.json()

  if (!fullName || !nationality || !dni) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
  }

  // Actualizamos el perfil usando el cliente ADMIN
  const { data: updatedProfile, error } = await supabaseAdmin
    .from('profiles')
    .update({ 
        full_name: fullName, 
        nationality: nationality, 
        dni: dni 
    })
    .eq('email', session.email)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar identidad:', error)
    return NextResponse.json({ error: 'Ocurrió un error al actualizar los datos en el servidor.' }, { status: 500 })
  }

  // Refrescar sesión con el nombre
  await setSession({
    ...session,
    full_name: fullName
  })

  return NextResponse.json({ success: true })
}
