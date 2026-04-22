import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productionPhoto: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    production: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { GET as getAll, POST } from '@/app/api/productions/route'
import { GET as getOne, PUT, DELETE } from '@/app/api/productions/[id]/route'
import { PUT as putPhotoOrder } from '@/app/api/productions/[id]/display-order/route'
import { PUT as putGroupOrder } from '@/app/api/productions/groups/[id]/display-order/route'

const mockPhoto = {
  id: 'photo-1',
  productionId: 'prod-1',
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

const mockProduction = {
  id: 'prod-1',
  playTitle: 'Echoes of Valor',
  productionYear: 2025,
  venue: 'Paris Community Theatre, Paris, TX',
  displayOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  photos: [mockPhoto],
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

function makePhotoOrderRequest(id: string, direction: string, auth = true): [Request, { params: Promise<{ id: string }> }] {
  const request = new Request(`http://localhost/api/productions/${id}/display-order`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: JSON.stringify({ direction }),
  })
  return [request, { params: Promise.resolve({ id }) }]
}

function makeGroupOrderRequest(id: string, direction: string, auth = true): [Request, { params: Promise<{ id: string }> }] {
  const request = new Request(`http://localhost/api/productions/groups/${id}/display-order`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: JSON.stringify({ direction }),
  })
  return [request, { params: Promise.resolve({ id }) }]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockTransaction(results: unknown[]) { ;(prisma.$transaction as any).mockResolvedValue(results) }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireAuth).mockReturnValue(true)
})

describe('GET /api/productions', () => {
  it('returns productions with nested photos', async () => {
    const mockProd2 = { ...mockProduction, id: 'prod-2', playTitle: 'Hamlet', photos: [] }
    vi.mocked(prisma.production.findMany).mockResolvedValue([mockProduction, mockProd2])
    const res = await getAll()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(2)
    expect(data[0].photos).toHaveLength(1)
    expect(data[0].playTitle).toBe('Echoes of Valor')
  })

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.production.findMany).mockRejectedValue(new Error('DB error'))
    const res = await getAll()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/productions', () => {
  it('creates a production photo with valid data (finds or creates production group)', async () => {
    vi.mocked(prisma.production.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.production.upsert).mockResolvedValue(mockProduction)
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.productionPhoto.create).mockResolvedValue(mockPhoto)
    const res = await POST(makeRequest('POST', validPhotoBody))
    expect(res.status).toBe(201)
    expect((await res.json()).id).toBe('photo-1')
  })

  it('creates a photo linked to an existing productionId (skips upsert)', async () => {
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.productionPhoto.create).mockResolvedValue(mockPhoto)
    const body = { ...validPhotoBody, productionId: 'prod-1' }
    const res = await POST(makeRequest('POST', body))
    expect(res.status).toBe(201)
    expect(prisma.production.upsert).not.toHaveBeenCalled()
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

describe('PUT /api/productions/[id]/display-order', () => {
  const photoUp = { ...mockPhoto, productionId: 'prod-1', displayOrder: 1 }
  const adjacentAbove = { ...mockPhoto, id: 'photo-2', displayOrder: 0 }
  const photoDown = { ...mockPhoto, productionId: 'prod-1', displayOrder: 0 }
  const adjacentBelow = { ...mockPhoto, id: 'photo-2', displayOrder: 1 }

  it('moves photo up', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(photoUp)
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(adjacentAbove)
    mockTransaction([{ ...photoUp, displayOrder: 0 }])
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'up')
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(200)
  })

  it('moves photo down', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(photoDown)
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(adjacentBelow)
    mockTransaction([{ ...photoDown, displayOrder: 1 }])
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'down')
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 400 when photo is already at the top', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(photoUp)
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(null)
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'up')
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/top/)
  })

  it('returns 400 when photo is already at the bottom', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(photoDown)
    vi.mocked(prisma.productionPhoto.findFirst).mockResolvedValue(null)
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'down')
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/bottom/)
  })

  it('returns 404 when photo not found', async () => {
    vi.mocked(prisma.productionPhoto.findUnique).mockResolvedValue(null)
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'up')
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makePhotoOrderRequest('photo-1', 'up', false)
    const res = await putPhotoOrder(req, ctx)
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/productions/groups/[id]/display-order', () => {
  const prod1 = { ...mockProduction, id: 'prod-1', displayOrder: 0, photos: [] }
  const prod2 = { ...mockProduction, id: 'prod-2', playTitle: 'Hamlet', displayOrder: 1, photos: [] }

  it('moves production group up', async () => {
    vi.mocked(prisma.production.findUnique).mockResolvedValue(prod2)
    vi.mocked(prisma.production.findFirst).mockResolvedValue(prod1)
    mockTransaction([{ ...prod2, displayOrder: 0 }])
    const [req, ctx] = makeGroupOrderRequest('prod-2', 'up')
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(200)
  })

  it('moves production group down', async () => {
    vi.mocked(prisma.production.findUnique).mockResolvedValue(prod1)
    vi.mocked(prisma.production.findFirst).mockResolvedValue(prod2)
    mockTransaction([{ ...prod1, displayOrder: 1 }])
    const [req, ctx] = makeGroupOrderRequest('prod-1', 'down')
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 400 when group is already at the top', async () => {
    vi.mocked(prisma.production.findUnique).mockResolvedValue(prod1)
    vi.mocked(prisma.production.findFirst).mockResolvedValue(null)
    const [req, ctx] = makeGroupOrderRequest('prod-1', 'up')
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/top/)
  })

  it('returns 400 when group is already at the bottom', async () => {
    vi.mocked(prisma.production.findUnique).mockResolvedValue(prod2)
    vi.mocked(prisma.production.findFirst).mockResolvedValue(null)
    const [req, ctx] = makeGroupOrderRequest('prod-2', 'down')
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/bottom/)
  })

  it('returns 404 when production not found', async () => {
    vi.mocked(prisma.production.findUnique).mockResolvedValue(null)
    const [req, ctx] = makeGroupOrderRequest('prod-99', 'up')
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeGroupOrderRequest('prod-1', 'up', false)
    const res = await putGroupOrder(req, ctx)
    expect(res.status).toBe(401)
  })
})
