import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    const isAdmin = session?.email?.toLowerCase()?.includes('learningheroes.com')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emails } = await req.json()
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: 'Invalid emails' }, { status: 400 })
    }

    const supabase = await createClient()

    // Insertar cada email en profiles si no existe y marcarlos como autorizados
    const inserts = emails.map(email => ({
      email: email.trim().toLowerCase(),
      is_authorized: true
    }))

    const { data, error } = await supabase
      .from('profiles')
      .upsert(inserts, { onConflict: 'email' })
      .select()

    if (error) {
      console.error('Error importing users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (error) {
    console.error('Admin import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
