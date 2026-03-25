import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // En producción, esto debería estar protegido por una API Key o rol de admin
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { students } = await request.json() // Array of { email, full_name }

  if (!Array.isArray(students)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  const results = {
    updated: 0,
    created: 0,
    errors: 0
  }

  for (const student of students) {
    try {
      // Intentar actualizar si existe, o insertar si no
      const normalizedEmail = student.email.trim().toLowerCase()
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          email: normalizedEmail,
          full_name: student.full_name,
          is_authorized: true
        }, { onConflict: 'email' })

      if (error) {
        console.error(`Error con ${student.email}:`, error)
        results.errors++
      } else {
        results.updated++
      }
    } catch (e) {
      results.errors++
    }
  }

  return NextResponse.json({ success: true, results })
}
