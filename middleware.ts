import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect auth pages to dashboard — single-user app, no login needed
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup', '/forgot-password'],
}
