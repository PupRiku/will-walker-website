import { describe, it, expect, beforeEach } from 'vitest'
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

const ADMIN_USER = 'admin'
const ADMIN_PASSWORD = 'secret'

function makeRequest(path: string, authHeader?: string): NextRequest {
  const url = `http://localhost${path}`
  const headers: Record<string, string> = {}
  if (authHeader) headers['Authorization'] = authHeader
  return new NextRequest(url, { headers })
}

function validAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64')
}

beforeEach(() => {
  process.env.ADMIN_USER = ADMIN_USER
  process.env.ADMIN_PASSWORD = ADMIN_PASSWORD
})

describe('middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = middleware(makeRequest('/admin'))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('returns 401 when Authorization header is not Basic auth', async () => {
    const res = middleware(makeRequest('/admin', 'Bearer sometoken'))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('returns 401 when credentials are wrong', async () => {
    const badAuth = 'Basic ' + Buffer.from('admin:wrongpassword').toString('base64')
    const res = middleware(makeRequest('/admin', badAuth))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('returns 401 when username is wrong', async () => {
    const badAuth = 'Basic ' + Buffer.from('wronguser:secret').toString('base64')
    const res = middleware(makeRequest('/admin', badAuth))
    expect(res.status).toBe(401)
  })

  it('calls next() (returns NextResponse.next()) when credentials are correct', async () => {
    const res = middleware(makeRequest('/admin', validAuthHeader()))
    // NextResponse.next() produces a 200 response with no body
    expect(res.status).toBe(200)
    expect(res.headers.get('WWW-Authenticate')).toBeNull()
  })

  it('also allows /admin/any-nested-path with correct credentials', async () => {
    const res = middleware(makeRequest('/admin/plays', validAuthHeader()))
    expect(res.status).toBe(200)
  })

  it('returns 401 on /admin/nested/path without credentials', async () => {
    const res = middleware(makeRequest('/admin/plays/edit'))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('WWW-Authenticate header is present on all 401 responses', async () => {
    const noAuth = middleware(makeRequest('/admin'))
    const badAuth = middleware(makeRequest('/admin', 'Basic ' + Buffer.from('x:y').toString('base64')))
    expect(noAuth.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
    expect(badAuth.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })
})
