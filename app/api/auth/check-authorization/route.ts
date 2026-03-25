import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_authorized')
      .ilike('email', normalizedEmail)
      .maybeSingle()

    if (error) {
       console.error('DB Error:', error)
       return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ authorized: false, reason: 'not_found' }, { status: 404 })
    }

    if (!profile.is_authorized) {
      return NextResponse.json({ authorized: false, reason: 'not_authorized' }, { status: 403 })
    }

    return NextResponse.json({ authorized: true })
  } catch (err) {
    console.error('Auth verification error:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
