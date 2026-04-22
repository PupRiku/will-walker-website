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

  const production = await prisma.production.findUnique({ where: { id } })
  if (!production) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orderFilter =
    direction === 'up'
      ? { lt: production.displayOrder }
      : { gt: production.displayOrder }

  const adjacent = await prisma.production.findFirst({
    where: { displayOrder: orderFilter },
    orderBy: { displayOrder: direction === 'up' ? 'desc' : 'asc' },
  })

  if (!adjacent) {
    return NextResponse.json(
      { error: `Production is already at the ${direction === 'up' ? 'top' : 'bottom'}` },
      { status: 400 }
    )
  }

  const [updated] = await prisma.$transaction([
    prisma.production.update({
      where: { id: production.id },
      data: { displayOrder: adjacent.displayOrder },
    }),
    prisma.production.update({
      where: { id: adjacent.id },
      data: { displayOrder: production.displayOrder },
    }),
  ])

  return NextResponse.json(updated)
}
