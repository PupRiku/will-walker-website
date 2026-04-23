import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

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

  const { src, alt } = body
  if (!src || typeof src !== 'string' || !src.trim())
    return NextResponse.json({ error: 'src is required' }, { status: 400 })
  if (!alt || typeof alt !== 'string' || !alt.trim())
    return NextResponse.json({ error: 'alt is required' }, { status: 400 })

  try {
    const photo = await prisma.productionPhoto.update({
      where: { id },
      data: {
        src: (body.src as string).trim(),
        alt: (body.alt as string).trim(),
        caption: typeof body.caption === 'string' && body.caption.trim() ? body.caption.trim() : null,
        ...(typeof body.playTitle === 'string' && { playTitle: body.playTitle.trim() }),
        ...(typeof body.productionYear === 'number' && { productionYear: body.productionYear }),
        ...(typeof body.venue === 'string' && { venue: body.venue.trim() }),
        ...(typeof body.displayOrder === 'number' && { displayOrder: body.displayOrder }),
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
