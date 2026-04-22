import { NextResponse } from 'next/server';

export async function POST() {
  return new NextResponse(
    '<html><body><script>window.location.href="/admin";</script></body></html>',
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'WWW-Authenticate': 'Basic realm="WLW Admin"',
      },
    }
  );
}
