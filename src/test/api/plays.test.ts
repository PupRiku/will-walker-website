import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock must be hoisted before any imports that use prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    play: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  isPrismaErrorCode: (err: unknown, code: string) =>
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === code,
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { GET as getAll, POST } from '@/app/api/plays/route'
import { GET as getOne, PUT, DELETE } from '@/app/api/plays/[slug]/route'
import { PUT as putFeatureOrder } from '@/app/api/plays/[slug]/feature-order/route'

const mockPlay = {
  id: 'cuid1',
  slug: 'my-play',
  title: 'My Play',
  category: 'Drama',
  runtime: '90 minutes',
  cast: '3M/2F',
  synopsis: 'A great play.',
  imageSrc: '/images/covers/my-play.png',
  pdfSrc: '',
  purchase: '',
  published: false,
  featured: false,
  featuredOrder: null,
  bannerText: '',
  bannerColor: '',
  showRoyaltiesButton: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const validPlayBody = {
  slug: 'my-play',
  title: 'My Play',
  category: 'Drama',
  runtime: '90 minutes',
  cast: '3M/2F',
  synopsis: 'A great play.',
  imageSrc: '/images/covers/my-play.png',
}

const AUTH_HEADER = 'Basic ' + Buffer.from('admin:password').toString('base64')

function makeRequest(body?: unknown, auth = true): Request {
  return new Request('http://localhost/api/plays', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeSlugRequest(method: string, body?: unknown, auth = true): [Request, { params: Promise<{ slug: string }> }] {
  const request = new Request('http://localhost/api/plays/my-play', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: AUTH_HEADER } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return [request, { params: Promise.resolve({ slug: 'my-play' }) }]
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireAuth).mockReturnValue(true)
})

describe('GET /api/plays', () => {
  it('returns all plays ordered correctly', async () => {
    vi.mocked(prisma.play.findMany).mockResolvedValue([mockPlay])
    const res = await getAll()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].slug).toBe('my-play')
    expect(prisma.play.findMany).toHaveBeenCalledWith({
      orderBy: [
        { featuredOrder: { sort: 'asc', nulls: 'last' } },
        { title: 'asc' },
      ],
    })
  })
})

describe('GET /api/plays/[slug]', () => {
  it('returns a play when found', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('GET')
    const res = await getOne(req, ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.slug).toBe('my-play')
  })

  it('returns 404 when not found', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(null)
    const [req, ctx] = makeSlugRequest('GET')
    const res = await getOne(req, ctx)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })
})

describe('POST /api/plays', () => {
  it('creates a play with valid data', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest(validPlayBody))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.slug).toBe('my-play')
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const res = await POST(makeRequest(validPlayBody, false))
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Basic realm="WLW Admin"')
  })

  it('returns 400 when title is missing', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, title: '' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/title/)
  })

  it('returns 400 when slug is invalid', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, slug: 'My Play!' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/slug/)
  })

  it('returns 400 when category is invalid', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, category: 'InvalidGenre' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/category/)
  })

  it('returns 400 when slug is duplicate', async () => {
    vi.mocked(prisma.play.create).mockRejectedValue({ code: 'P2002' })
    const res = await POST(makeRequest(validPlayBody))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/slug already exists/)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ slug: 'my-play', title: 'My Play' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when purchase is not an http(s) URL', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, purchase: 'www.example.com/buy' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Purchase URL/)
    expect(prisma.play.create).not.toHaveBeenCalled()
  })

  it('trims the purchase URL before saving', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest({ ...validPlayBody, purchase: '  https://example.com/buy  ' }))
    expect(res.status).toBe(201)
    expect(vi.mocked(prisma.play.create).mock.calls[0][0].data.purchase).toBe('https://example.com/buy')
  })

  it('stores a whitespace-only purchase URL as empty', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest({ ...validPlayBody, purchase: '   ' }))
    expect(res.status).toBe(201)
    expect(vi.mocked(prisma.play.create).mock.calls[0][0].data.purchase).toBe('')
  })

  it('returns 400 when pdfSrc is not an http(s) URL', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, pdfSrc: 'drive.google.com/file/d/abc' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Sample PDF URL/)
    expect(prisma.play.create).not.toHaveBeenCalled()
  })

  it('trims the sample PDF URL before saving', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest({ ...validPlayBody, pdfSrc: ' https://drive.google.com/file/d/abc ' }))
    expect(res.status).toBe(201)
    expect(vi.mocked(prisma.play.create).mock.calls[0][0].data.pdfSrc).toBe('https://drive.google.com/file/d/abc')
  })

  it('defaults bannerText, bannerColor and showRoyaltiesButton when omitted', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest(validPlayBody))
    expect(res.status).toBe(201)
    const data = vi.mocked(prisma.play.create).mock.calls[0][0].data
    expect(data.bannerText).toBe('')
    expect(data.bannerColor).toBe('')
    expect(data.showRoyaltiesButton).toBe(true)
  })

  it('trims bannerText and normalizes bannerColor before saving', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(
      makeRequest({ ...validPlayBody, bannerText: '  Free to Produce  ', bannerColor: ' #4B5320 ' }),
    )
    expect(res.status).toBe(201)
    const data = vi.mocked(prisma.play.create).mock.calls[0][0].data
    expect(data.bannerText).toBe('Free to Produce')
    expect(data.bannerColor).toBe('#4b5320')
  })

  it('expands a 3-digit bannerColor shorthand to 6 digits', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(makeRequest({ ...validPlayBody, bannerColor: '#abc' }))
    expect(res.status).toBe(201)
    expect(vi.mocked(prisma.play.create).mock.calls[0][0].data.bannerColor).toBe('#aabbcc')
  })

  it('returns 400 when bannerColor is not a valid hex color', async () => {
    const res = await POST(makeRequest({ ...validPlayBody, bannerColor: 'not-a-color' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Banner Color/)
    expect(prisma.play.create).not.toHaveBeenCalled()
  })

  it('persists showRoyaltiesButton: false for an unpublished play', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(
      makeRequest({ ...validPlayBody, published: false, showRoyaltiesButton: false }),
    )
    expect(res.status).toBe(201)
    expect(vi.mocked(prisma.play.create).mock.calls[0][0].data.showRoyaltiesButton).toBe(false)
  })

  it('forces showRoyaltiesButton to false for a published play even when the request sends true', async () => {
    vi.mocked(prisma.play.create).mockResolvedValue(mockPlay)
    const res = await POST(
      makeRequest({ ...validPlayBody, published: true, purchase: 'https://example.com/buy', showRoyaltiesButton: true }),
    )
    expect(res.status).toBe(201)
    const data = vi.mocked(prisma.play.create).mock.calls[0][0].data
    expect(data.published).toBe(true)
    expect(data.showRoyaltiesButton).toBe(false)
  })
})

describe('PUT /api/plays/[slug]', () => {
  it('updates a play with valid data', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', validPlayBody)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect((await res.json()).slug).toBe('my-play')
  })

  it('returns 404 when play does not exist', async () => {
    vi.mocked(prisma.play.update).mockRejectedValue({ code: 'P2025' })
    const [req, ctx] = makeSlugRequest('PUT', validPlayBody)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeSlugRequest('PUT', validPlayBody, false)
    const res = await PUT(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 400 when purchase is not an http(s) URL', async () => {
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, purchase: 'TBD' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Purchase URL/)
    expect(prisma.play.update).not.toHaveBeenCalled()
  })

  it('trims the purchase URL before saving', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, purchase: ' https://example.com/buy ' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect(vi.mocked(prisma.play.update).mock.calls[0][0].data.purchase).toBe('https://example.com/buy')
  })

  it('returns 400 when pdfSrc is not an http(s) URL', async () => {
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, pdfSrc: 'TBD' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Sample PDF URL/)
    expect(prisma.play.update).not.toHaveBeenCalled()
  })

  it('trims the sample PDF URL before saving', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, pdfSrc: ' https://drive.google.com/file/d/abc ' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect(vi.mocked(prisma.play.update).mock.calls[0][0].data.pdfSrc).toBe('https://drive.google.com/file/d/abc')
  })

  it('trims bannerText and normalizes bannerColor before saving', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', {
      ...validPlayBody,
      bannerText: '  Free to Produce  ',
      bannerColor: ' #4B5320 ',
    })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    const data = vi.mocked(prisma.play.update).mock.calls[0][0].data
    expect(data.bannerText).toBe('Free to Produce')
    expect(data.bannerColor).toBe('#4b5320')
  })

  it('expands a 3-digit bannerColor shorthand to 6 digits', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, bannerColor: '#abc' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect(vi.mocked(prisma.play.update).mock.calls[0][0].data.bannerColor).toBe('#aabbcc')
  })

  it('returns 400 when bannerColor is not a valid hex color', async () => {
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, bannerColor: 'not-a-color' })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/Banner Color/)
    expect(prisma.play.update).not.toHaveBeenCalled()
  })

  it('persists showRoyaltiesButton: false for an unpublished play', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', {
      ...validPlayBody,
      published: false,
      showRoyaltiesButton: false,
    })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    expect(vi.mocked(prisma.play.update).mock.calls[0][0].data.showRoyaltiesButton).toBe(false)
  })

  it('forces showRoyaltiesButton to false for a published play even when the request sends true', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', {
      ...validPlayBody,
      published: true,
      purchase: 'https://example.com/buy',
      showRoyaltiesButton: true,
    })
    const res = await PUT(req, ctx)
    expect(res.status).toBe(200)
    const data = vi.mocked(prisma.play.update).mock.calls[0][0].data
    expect(data.published).toBe(true)
    expect(data.showRoyaltiesButton).toBe(false)
  })

  it('forces showRoyaltiesButton to false when publishing a play that previously had the toggle on', async () => {
    // Simulates a row created before this field existed, or one where the
    // stored toggle is stale true from before it was published — the API
    // must not trust the client's value once published is true.
    vi.mocked(prisma.play.update).mockResolvedValue({ ...mockPlay, showRoyaltiesButton: true })
    const [req, ctx] = makeSlugRequest('PUT', {
      ...validPlayBody,
      published: true,
      purchase: 'https://example.com/buy',
      showRoyaltiesButton: true,
    })
    await PUT(req, ctx)
    expect(vi.mocked(prisma.play.update).mock.calls[0][0].data.showRoyaltiesButton).toBe(false)
  })

  it('leaves bannerText, bannerColor and showRoyaltiesButton untouched when the request omits them', async () => {
    // An older/cached admin bundle or another API client predating these
    // fields must not reset a configured banner or a manual royalties
    // opt-out just by editing an unrelated field.
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', { ...validPlayBody, published: false })
    await PUT(req, ctx)
    const data = vi.mocked(prisma.play.update).mock.calls[0][0].data
    expect(data).not.toHaveProperty('bannerText')
    expect(data).not.toHaveProperty('bannerColor')
    expect(data).not.toHaveProperty('showRoyaltiesButton')
  })

  it('still forces showRoyaltiesButton to false on publish even when the request omits it', async () => {
    vi.mocked(prisma.play.update).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('PUT', {
      ...validPlayBody,
      published: true,
      purchase: 'https://example.com/buy',
    })
    await PUT(req, ctx)
    const data = vi.mocked(prisma.play.update).mock.calls[0][0].data
    expect(data.showRoyaltiesButton).toBe(false)
    expect(data).not.toHaveProperty('bannerText')
    expect(data).not.toHaveProperty('bannerColor')
  })
})

describe('DELETE /api/plays/[slug]', () => {
  it('deletes a play and returns 204', async () => {
    vi.mocked(prisma.play.delete).mockResolvedValue(mockPlay)
    const [req, ctx] = makeSlugRequest('DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(204)
  })

  it('returns 404 when play does not exist', async () => {
    vi.mocked(prisma.play.delete).mockRejectedValue({ code: 'P2025' })
    const [req, ctx] = makeSlugRequest('DELETE')
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeSlugRequest('DELETE', undefined, false)
    const res = await DELETE(req, ctx)
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/plays/[slug]/feature-order', () => {
  const featuredPlay = { ...mockPlay, featured: true, featuredOrder: 2 }
  const adjacentUp = { ...mockPlay, slug: 'other-play', featuredOrder: 1 }
  const adjacentDown = { ...mockPlay, slug: 'other-play', featuredOrder: 3 }

  function makeFeatureRequest(body: unknown, auth = true) {
    const request = new Request('http://localhost/api/plays/my-play/feature-order', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: AUTH_HEADER } : {}),
      },
      body: JSON.stringify(body),
    })
    return [request, { params: Promise.resolve({ slug: 'my-play' }) }] as const
  }

  it('moves a play up by swapping featuredOrder', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(featuredPlay)
    vi.mocked(prisma.play.findFirst).mockResolvedValue(adjacentUp)
    vi.mocked(prisma.$transaction).mockResolvedValue([{ ...featuredPlay, featuredOrder: 1 }, {}])
    const [req, ctx] = makeFeatureRequest({ direction: 'up' })
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(200)
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('moves a play down by swapping featuredOrder', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(featuredPlay)
    vi.mocked(prisma.play.findFirst).mockResolvedValue(adjacentDown)
    vi.mocked(prisma.$transaction).mockResolvedValue([{ ...featuredPlay, featuredOrder: 3 }, {}])
    const [req, ctx] = makeFeatureRequest({ direction: 'down' })
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(200)
  })

  it('returns 400 when already at top', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(featuredPlay)
    vi.mocked(prisma.play.findFirst).mockResolvedValue(null)
    const [req, ctx] = makeFeatureRequest({ direction: 'up' })
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/top/)
  })

  it('returns 400 when already at bottom', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(featuredPlay)
    vi.mocked(prisma.play.findFirst).mockResolvedValue(null)
    const [req, ctx] = makeFeatureRequest({ direction: 'down' })
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/bottom/)
  })

  it('returns 404 when play not found', async () => {
    vi.mocked(prisma.play.findUnique).mockResolvedValue(null)
    const [req, ctx] = makeFeatureRequest({ direction: 'up' })
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(404)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockReturnValue(false)
    const [req, ctx] = makeFeatureRequest({ direction: 'up' }, false)
    const res = await putFeatureOrder(req, ctx)
    expect(res.status).toBe(401)
  })
})
