import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

function validatePhoto(body: Record<string, unknown>) {
  const { src, alt, productionId, playTitle, productionYear, venue } = body

  if (!src || typeof src !== 'string' || !src.trim())
    return 'src is required'
  if (!alt || typeof alt !== 'string' || !alt.trim())
    return 'alt is required'

  // Either productionId or the three identifying fields are required
  if (!productionId) {
    if (!playTitle || typeof playTitle !== 'string' || !playTitle.trim())
      return 'playTitle is required'
    if (productionYear === undefined || productionYear === null)
      return 'productionYear is required'
    if (!Number.isInteger(productionYear) || (productionYear as number) < 1900 || (productionYear as number) > 2100)
      return 'productionYear must be an integer between 1900 and 2100'
    if (!venue || typeof venue !== 'string' || !venue.trim())
      return 'venue is required'
  }

  return null
}

export async function GET() {
  try {
    const productions = await prisma.production.findMany({
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { displayOrder: 'asc' },
    })
    return NextResponse.json(productions)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validationError = validatePhoto(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    let productionId = typeof body.productionId === 'string' ? body.productionId : null

    if (!productionId) {
      // Find or create the Production group
      const playTitle = (body.playTitle as string).trim()
      const venue = (body.venue as string).trim()
      const productionYear = body.productionYear as number

      const highestOrder = await prisma.production.findFirst({
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      })
      const nextOrder = (highestOrder?.displayOrder ?? -1) + 1

      const production = await prisma.production.upsert({
        where: { playTitle_venue_productionYear: { playTitle, venue, productionYear } },
        update: {},
        create: { playTitle, venue, productionYear, displayOrder: nextOrder },
      })
      productionId = production.id
    }

    // Find the next displayOrder within this production
    const lastPhoto = await prisma.productionPhoto.findFirst({
      where: { productionId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    })
    const displayOrder = typeof body.displayOrder === 'number'
      ? body.displayOrder
      : (lastPhoto?.displayOrder ?? -1) + 1

    const photo = await prisma.productionPhoto.create({
      data: {
        productionId,
        playTitle: (body.playTitle as string | undefined)?.trim() ?? '',
        productionYear: (body.productionYear as number | undefined) ?? 0,
        venue: (body.venue as string | undefined)?.trim() ?? '',
        src: (body.src as string).trim(),
        alt: (body.alt as string).trim(),
        caption: typeof body.caption === 'string' && body.caption.trim() ? body.caption.trim() : null,
        displayOrder,
      },
    })
    return NextResponse.json(photo, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
