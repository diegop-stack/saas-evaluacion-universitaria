import { supabaseAdmin } from '@/lib/supabase/admin'
import { setSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const isTeamEmail = normalizedEmail.endsWith('@learningheroes.com')

  // Single RPC call replaces 4-5 sequential queries (~600ms → ~30ms)
  const { data: result, error: rpcError } = await supabaseAdmin
    .rpc('login_and_load_dashboard', { p_email: normalizedEmail })

  // If profile not found and is team email, auto-create and retry
  if (result && !result.success && result.error === 'not_found' && isTeamEmail) {
    await supabaseAdmin
      .from('profiles')
      .upsert({ 
        email: normalizedEmail, 
        is_authorized: true, 
        full_name: 'Admin Team' 
      }, { onConflict: 'email' })

    // Retry the RPC after creating the profile
    const { data: retryResult } = await supabaseAdmin
      .rpc('login_and_load_dashboard', { p_email: normalizedEmail })

    if (retryResult?.success) {
      const profile = retryResult.profile
      await setSession({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || 'Admin Team',
        is_authorized: true
      })
      const hasIdentity = profile.full_name && profile.dni && profile.nationality
      return NextResponse.json({ success: true, hasIdentity: !!hasIdentity })
    }
  }

  // Handle RPC errors
  if (rpcError || !result) {
    console.error('Login RPC error:', rpcError)
    return NextResponse.json({ error: 'Error interno al verificar acceso.' }, { status: 500 })
  }

  // Profile not found and not team email
  if (!result.success) {
    const statusCode = result.error === 'not_authorized' ? 403 : 401
    return NextResponse.json({ error: result.message }, { status: statusCode })
  }

  // Success — set session
  const profile = result.profile
  await setSession({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || '',
    is_authorized: true
  })

  const hasIdentity = profile.full_name && profile.dni && profile.nationality

  return NextResponse.json({ 
    success: true, 
    hasIdentity: !!hasIdentity 
  })
}
