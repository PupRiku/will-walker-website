import { NextResponse } from 'next/server'
import { prisma, isPrismaErrorCode } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { VALID_CATEGORIES, ERROR_MESSAGES } from '@/lib/constants'
import { validateOptionalHttpUrl } from '@/utils/url'
import { normalizeHexColor, validateOptionalHexColor } from '@/utils/color'

function validatePlay(body: Record<string, unknown>) {
  const { title, slug, category, runtime, cast, synopsis, imageSrc } = body

  if (!title || typeof title !== 'string' || !title.trim())
    return 'title is required'
  if (!slug || typeof slug !== 'string' || !slug.trim())
    return 'slug is required'
  if (!/^[a-z0-9-]+$/.test(slug as string))
    return 'slug must be URL-safe (lowercase letters, numbers, hyphens only)'
  if (!category || !VALID_CATEGORIES.includes(category as string))
    return `category must be one of: ${VALID_CATEGORIES.join(', ')}`
  if (!runtime || typeof runtime !== 'string' || !runtime.trim())
    return 'runtime is required'
  if (!cast || typeof cast !== 'string' || !cast.trim())
    return 'cast is required'
  if (!synopsis || typeof synopsis !== 'string' || !synopsis.trim())
    return 'synopsis is required'
  if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.trim())
    return 'imageSrc is required'

  const pdfSrcError = validateOptionalHttpUrl(body.pdfSrc, 'Sample PDF URL')
  if (pdfSrcError) return pdfSrcError
  const purchaseError = validateOptionalHttpUrl(body.purchase, 'Purchase URL')
  if (purchaseError) return purchaseError
  const bannerColorError = validateOptionalHexColor(body.bannerColor, 'Banner Color')
  if (bannerColorError) return bannerColorError

  return null
}

type Params = Promise<{ slug: string }>

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params
  try {
    const play = await prisma.play.findUnique({ where: { slug } })
    if (!play) return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND }, { status: 404 })
    return NextResponse.json(play)
  } catch (error) {
    console.error('GET /api/plays/[slug] error:', error)
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.INVALID_JSON }, { status: 400 })
  }

  const validationError = validatePlay(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const published = typeof body.published === 'boolean' ? body.published : false

    // A PUT that omits bannerText/bannerColor/showRoyaltiesButton (an older
    // cached admin bundle, or another API client written before these
    // fields existed) must not reset them — that would silently clear a
    // configured banner or re-enable a manual royalties opt-out on every
    // edit. Only touch a field when the request actually sent it, except
    // showRoyaltiesButton must still be forced off for a published play
    // regardless of what the request sent or omitted, since that invariant
    // has to hold everywhere a play is written.
    const optionalUpdates: Record<string, unknown> = {}
    if (typeof body.bannerText === 'string') {
      optionalUpdates.bannerText = body.bannerText.trim()
    }
    if (typeof body.bannerColor === 'string') {
      optionalUpdates.bannerColor = normalizeHexColor(body.bannerColor) ?? ''
    }
    if (published) {
      optionalUpdates.showRoyaltiesButton = false
    } else if (typeof body.showRoyaltiesButton === 'boolean') {
      optionalUpdates.showRoyaltiesButton = body.showRoyaltiesButton
    }

    const play = await prisma.play.update({
      where: { slug },
      data: {
        slug: (body.slug as string).trim(),
        title: (body.title as string).trim(),
        category: body.category as string,
        runtime: (body.runtime as string).trim(),
        cast: (body.cast as string).trim(),
        synopsis: (body.synopsis as string).trim(),
        imageSrc: (body.imageSrc as string).trim(),
        pdfSrc: typeof body.pdfSrc === 'string' ? body.pdfSrc.trim() : '',
        purchase: typeof body.purchase === 'string' ? body.purchase.trim() : '',
        published,
        featured: typeof body.featured === 'boolean' ? body.featured : false,
        featuredOrder: typeof body.featuredOrder === 'number' ? body.featuredOrder : null,
        ...optionalUpdates,
      },
    })
    return NextResponse.json(play)
  } catch (e: unknown) {
    if (isPrismaErrorCode(e, 'P2025')) {
      return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND }, { status: 404 })
    }
    console.error('/api/plays/[slug] error:', e)
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { slug } = await params

  try {
    await prisma.play.delete({ where: { slug } })
    return new NextResponse(null, { status: 204 })
  } catch (e: unknown) {
    if (isPrismaErrorCode(e, 'P2025')) {
      return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND }, { status: 404 })
    }
    console.error('/api/plays/[slug] error:', e)
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL }, { status: 500 })
  }
}
