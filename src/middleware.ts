import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' },
    })
  }

  const base64 = authHeader.slice(6)
  const decoded = Buffer.from(base64, 'base64').toString('utf-8')
  const colonIndex = decoded.indexOf(':')
  if (colonIndex === -1) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' },
    })
  }

  const user = decoded.slice(0, colonIndex)
  const password = decoded.slice(colonIndex + 1)

  if (user !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
