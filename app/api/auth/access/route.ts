import { supabaseAdmin } from '@/lib/supabase/admin'
import { setSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase()

  // Autorización automática por dominio para el equipo
  const isTeamEmail = normalizedEmail.endsWith('@learningheroes.com')

  // Verificamos si existe el perfil autorizado
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .single()

  // Si no está en la base de datos y es del equipo, lo autorizamos/creamos automáticamente
  if (!profile && isTeamEmail) {
    const { data: newProfile, error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        email: normalizedEmail, 
        is_authorized: true, 
        full_name: 'Admin Team' 
      }, { onConflict: 'email' })
      .select()
      .single()
    
    if (!upsertError) profile = newProfile
  }

  // Si no está autorizado y NO es del equipo, bloqueamos
  if ((!profile || !profile.is_authorized) && !isTeamEmail) {
    return NextResponse.json({ error: 'Tu email no está registrado o no está autorizado al examen.' }, { status: 401 })
  }

  // Guardamos la sesión (ahora siempre tendrá un perfil válido o el email)
  const sessionData = {
    id: profile?.id || 'admin-temp-id',
    email: normalizedEmail,
    full_name: profile?.full_name || 'Admin Team',
    is_authorized: true
  }

  await setSession(sessionData)

  // Retornamos si ya tiene identidad completa para saltar la página de acreditación
  const hasIdentity = profile?.full_name && profile?.dni && profile?.nationality

  return NextResponse.json({ 
    success: true, 
    hasIdentity: !!hasIdentity 
  })
}
