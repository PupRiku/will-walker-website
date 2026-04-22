import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

function validatePhoto(body: Record<string, unknown>) {
  const { playTitle, productionYear, venue, src, alt } = body

  if (!playTitle || typeof playTitle !== 'string' || !playTitle.trim())
    return 'playTitle is required'
  if (productionYear === undefined || productionYear === null)
    return 'productionYear is required'
  if (!Number.isInteger(productionYear) || (productionYear as number) < 1900 || (productionYear as number) > 2100)
    return 'productionYear must be an integer between 1900 and 2100'
  if (!venue || typeof venue !== 'string' || !venue.trim())
    return 'venue is required'
  if (!src || typeof src !== 'string' || !src.trim())
    return 'src is required'
  if (!alt || typeof alt !== 'string' || !alt.trim())
    return 'alt is required'

  return null
}

export async function GET() {
  try {
    const photos = await prisma.productionPhoto.findMany({
      orderBy: [{ productionYear: 'desc' }, { displayOrder: 'asc' }],
    })

    // Group by playTitle + productionYear + venue
    const groups: Record<string, {
      playTitle: string
      productionYear: number
      venue: string
      photos: typeof photos
    }> = {}

    for (const photo of photos) {
      const key = `${photo.playTitle}::${photo.productionYear}::${photo.venue}`
      if (!groups[key]) {
        groups[key] = {
          playTitle: photo.playTitle,
          productionYear: photo.productionYear,
          venue: photo.venue,
          photos: [],
        }
      }
      groups[key].photos.push(photo)
    }

    return NextResponse.json(Object.values(groups))
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
    const photo = await prisma.productionPhoto.create({
      data: {
        playTitle: (body.playTitle as string).trim(),
        productionYear: body.productionYear as number,
        venue: (body.venue as string).trim(),
        src: (body.src as string).trim(),
        alt: (body.alt as string).trim(),
        caption: typeof body.caption === 'string' ? body.caption : null,
        displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 0,
      },
    })
    return NextResponse.json(photo, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
