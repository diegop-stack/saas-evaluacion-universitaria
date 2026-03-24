import { supabaseAdmin } from '@/lib/supabase/admin'
import { setSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase()

  // Verificamos si existe el perfil autorizado usando el cliente ADMIN
  // El cliente normal fallaría por RLS porque el usuario aún no tiene sesión de Auth
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .single()

  if (error || !profile?.is_authorized) {
    return NextResponse.json({ error: 'Tu email no está registrado o no está autorizado al examen.' }, { status: 401 })
  }

  // Guardamos la sesión
  await setSession({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    is_authorized: profile.is_authorized
  })

  // Retornamos si ya tiene identidad completa para saltar la página de acreditación
  const hasIdentity = profile.full_name && profile.dni && profile.nationality

  return NextResponse.json({ 
    success: true, 
    hasIdentity: !!hasIdentity 
  })
}
