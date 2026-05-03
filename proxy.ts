import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const userId = request.cookies.get('session_user_id')?.value
  if (userId) return NextResponse.next()

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
