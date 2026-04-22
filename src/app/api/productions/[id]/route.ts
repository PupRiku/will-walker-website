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

type Params = Promise<{ id: string }>

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const photo = await prisma.productionPhoto.findUnique({ where: { id } })
    if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(photo)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { id } = await params

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
    const photo = await prisma.productionPhoto.update({
      where: { id },
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
    return NextResponse.json(photo)
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { id } = await params

  try {
    await prisma.productionPhoto.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
