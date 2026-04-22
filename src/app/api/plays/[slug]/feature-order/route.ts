import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Params = Promise<{ slug: string }>

export async function PUT(request: Request, { params }: { params: Params }) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    )
  }

  const { slug } = await params

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

  const play = await prisma.play.findUnique({ where: { slug } })
  if (!play) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (play.featuredOrder === null) {
    return NextResponse.json({ error: 'Play is not featured' }, { status: 400 })
  }

  // Find the adjacent featured play to swap with
  const orderFilter =
    direction === 'up'
      ? { lt: play.featuredOrder, not: null as null }
      : { gt: play.featuredOrder, not: null as null };

  const adjacent = await prisma.play.findFirst({
    where: { featuredOrder: orderFilter },
    orderBy: {
      featuredOrder: direction === 'up' ? 'desc' : 'asc',
    },
  })

  if (!adjacent) {
    return NextResponse.json(
      { error: `Play is already at the ${direction === 'up' ? 'top' : 'bottom'} of the featured list` },
      { status: 400 }
    )
  }

  // Swap featuredOrder values
  const [updated] = await prisma.$transaction([
    prisma.play.update({
      where: { slug: play.slug },
      data: { featuredOrder: adjacent.featuredOrder },
    }),
    prisma.play.update({
      where: { slug: adjacent.slug },
      data: { featuredOrder: play.featuredOrder },
    }),
  ])

  return NextResponse.json(updated)
}
