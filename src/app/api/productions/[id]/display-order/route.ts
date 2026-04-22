import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function PUT(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { id } = await params

  let body: { direction?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { direction } = body
  if (direction !== 'up' && direction !== 'down') {
    return NextResponse.json({ error: 'direction must be "up" or "down"' }, { status: 400 })
  }

  const photo = await prisma.productionPhoto.findUnique({ where: { id } })
  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!photo.productionId) {
    return NextResponse.json({ error: 'Photo is not linked to a production' }, { status: 400 })
  }

  const orderFilter =
    direction === 'up'
      ? { lt: photo.displayOrder }
      : { gt: photo.displayOrder }

  const adjacent = await prisma.productionPhoto.findFirst({
    where: {
      productionId: photo.productionId,
      displayOrder: orderFilter,
    },
    orderBy: { displayOrder: direction === 'up' ? 'desc' : 'asc' },
  })

  if (!adjacent) {
    return NextResponse.json(
      { error: `Photo is already at the ${direction === 'up' ? 'top' : 'bottom'} of the production` },
      { status: 400 }
    )
  }

  const [updated] = await prisma.$transaction([
    prisma.productionPhoto.update({
      where: { id: photo.id },
      data: { displayOrder: adjacent.displayOrder },
    }),
    prisma.productionPhoto.update({
      where: { id: adjacent.id },
      data: { displayOrder: photo.displayOrder },
    }),
  ])

  return NextResponse.json(updated)
}
