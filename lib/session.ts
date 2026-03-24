import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-ia-heroes'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function setSession(session: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const sessionToken = await encrypt(session)
  
  const cookieStore = await cookies()
  cookieStore.set('ia_heroes_session', sessionToken, { 
    expires, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('ia_heroes_session')?.value
  if (!sessionToken) return null
  return await decrypt(sessionToken)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('ia_heroes_session')
}
