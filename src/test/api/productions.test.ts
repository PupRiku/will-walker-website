import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productionPhoto: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { GET as getAll, POST } from '@/app/api/productions/route'
import { GET as getOne, PUT, DELETE } from '@/app/api/productions/[id]/route'

const mockPhoto = {
  id: 'photo-1',
  playTitle: 'Echoes of Valor',
  productionYear: 2025,
  venue: 'Paris Community Theatre, Paris, TX',
  src: '/images/photos/eov-01.jpg',
  alt: 'Cast at table read',
  caption: 'First table read',
  displayOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const validPhotoBody = {
  playTitle: 'Echoes of Valor',
  productionYear: 2025,
  venue: 'Paris Community Theatre, Paris, TX',
  src: '/images/photos/eov-01.jpg',
  alt: 'Cast at table read',
}

const AUTH_HEADER = 'Basic ' + Buffer.from('admin:password').toString('base64')

function makeRequest(method: string, body?: unknown, auth = true): Request {
  return new Request('http://localhost/api/productions', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeIdRequest(method: string, body?: unknown, auth = true): [Request, { params: Promise<{ id: string }> }] {
  const request = new Request('http://localhost/api/productions/photo-1', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return [request, { params: Promise.resolve({ id: 'photo-1' }) }]
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireAuth).mockReturnValue(true)
})

describe('GET /api/productions', () => {
  it('returns photos grouped by playTitle + productionYear + venue', async () => {
    const photo2 = { ...mockPhoto, id: 'photo-2', displayOrder: 1 }
    vi.mocked(prisma.productionPhoto.findMany).mockResolvedValue([mockPhoto, photo2])
    const res = await getAll()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].photos).toHaveLength(2)
    expect(data[0].playTitle).toBe('Echoes of Valor')
  })

  it('groups distinct productions separately', async () => {
    const otherPhoto = {
      ...mockPhoto,
      id: 'photo-3',
      playTitle: 'Hamlet',
      productionYear: 2024,
      venue: 'Other Theatre',
    }
    vi.mocked(prisma.productionPhoto.findMany).mockResolvedValue([mockPhoto, otherPhoto])
    const res = await getAll()
    const data = await res.json()
    expect(data).toHaveLength(2)
  })
})

describe('POST /api/productions', () => {
  it('creates a production photo with valid data', async () => {
    vi.mocked(prisma.productionPhoto.create).mockResolvedValue(mockPhoto)
    const res = await POST(makeRequest('POST', validPhotoBody))
    expect(res.status).toBe(201)
    expect((await res.json()).id).toBe('photo-1')
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const res = await POST(makeRequest('POST', validPhotoBody, false))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('returns 400 when playTitle is missing', async () => {
    const res = await POST(makeRequest('POST', { ...validPhotoBody, playTitle: '' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/playTitle/)
  })

  it('returns 400 when productionYear is missing', async () => {
    const { productionYear: _, ...bodyWithout } = validPhotoBody
    const res = await POST(makeRequest('POST', bodyWithout))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/productionYear/)
  })

  it('returns 400 when productionYear is out of range', async () => {
    const res = await POST(makeRequest('POST', { ...validPhotoBody, productionYear: 1800 }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/productionYear/)
  })

  it('returns 400 when src is missing', async () => {
    const res = await POST(makeRequest('POST', { ...validPhotoBody, src: '' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/src/)
  })

  it('returns 400 when alt is missing', async () => {
    const res = await POST(makeRequest('POST', { ...validPhotoBody, alt: '' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/alt/)
  })
})

describe('GET /api/productions/[id]', () => {
  it('returns a photo when found', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(mockPhoto)
    const [req, ctx] = makeIdRequest('GET')
    const res = await getOne(req, ctx)
    expect(res.status).toBe(200)
    expect((await res.json()).id).toBe('photo-1')
  })

  it('returns 404 when not found', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(null)
    const [req, ctx] = makeIdRequest('GET')
    const res = await getOne(req, ctx)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })
})

describe('PUT /api/productions/[id]', () => {
  it('updates a photo with valid data', async () => {
    vi.mocked(prisma.productionPhoto.update).mockResolvedValue(mockPhoto)
    const [req, ctx] = makeIdRequest('PUT', validPhotoBody)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect((await res.json()).id).toBe('photo-1')
  })

  it('returns 404 when photo does not exist', async () => {
    vi.mocked(prisma.productionPhoto.update).mockRejectedValue({ code: 'P2025' })
    const [req, ctx] = makeIdRequest('PUT', validPhotoBody)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeIdRequest('PUT', validPhotoBody, false)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/productions/[id]', () => {
  it('deletes a photo and returns 204', async () => {
    vi.mocked(prisma.productionPhoto.delete).mockResolvedValue(mockPhoto)
    const [req, ctx] = makeIdRequest('DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(204)
  })

  it('returns 404 when photo does not exist', async () => {
    vi.mocked(prisma.productionPhoto.delete).mockRejectedValue({ code: 'P2025' })
    const [req, ctx] = makeIdRequest('DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeIdRequest('DELETE', undefined, false)
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(401)
  })
})
