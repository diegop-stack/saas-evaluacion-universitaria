import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-ia-heroes'
const key = new TextEncoder().encode(secretKey)

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('ia_heroes_session')?.value
  const { pathname } = request.nextUrl

  // Páginas públicas y recursos estáticos
  const isPublicPage = 
    pathname === '/login' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/logos/') || 
    pathname === '/favicon.ico' ||
    pathname === '/auth/signout'

  if (!sessionToken) {
    if (isPublicPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(sessionToken, key, {
      algorithms: ['HS256'],
    })

    // Si está intentando ir al login de nuevo, redirigir al dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si no ha completado el perfil (full_name missing), redirigir a /identity
    if (!payload.full_name && pathname !== '/identity' && !pathname.startsWith('/api/') && !pathname.startsWith('/logos/') && pathname !== '/auth/signout') {
        return NextResponse.redirect(new URL('/identity', request.url))
    }

    return NextResponse.next()
  } catch (e) {
    if (isPublicPage) return NextResponse.next()
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('ia_heroes_session')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logos (public logos)
     */
    '/((?!_next/static|_next/image|favicon.ico|logos).*)',
  ],
}
