import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/cn/') || pathname === '/cn') {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/cn', '')
    const response = NextResponse.rewrite(url)
    response.headers.set('x-locale', 'zh')
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
