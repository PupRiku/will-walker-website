import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const VALID_CATEGORIES = [
  'Drama',
  'Comedy',
  'Historical Drama',
  "Children's Play",
  'Political Satire',
  'Thriller',
  'SciFi/Fantasy',
  'Radio Play',
  'One Act Play',
  'Screenplay',
  'Comedy/Drama',
  'Theater for Youth',
  'Collection',
];

function validatePlay(body: Record<string, unknown>) {
  const { title, slug, category, runtime, cast, synopsis, imageSrc } = body;

  if (!title || typeof title !== 'string' || !title.trim())
    return 'title is required';
  if (!slug || typeof slug !== 'string' || !slug.trim())
    return 'slug is required';
  if (!/^[a-z0-9-]+$/.test(slug as string))
    return 'slug must be URL-safe (lowercase letters, numbers, hyphens only)';
  if (!category || !VALID_CATEGORIES.includes(category as string))
    return `category must be one of: ${VALID_CATEGORIES.join(', ')}`;
  if (!runtime || typeof runtime !== 'string' || !runtime.trim())
    return 'runtime is required';
  if (!cast || typeof cast !== 'string' || !cast.trim())
    return 'cast is required';
  if (!synopsis || typeof synopsis !== 'string' || !synopsis.trim())
    return 'synopsis is required';
  if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.trim())
    return 'imageSrc is required';

  return null;
}

export async function GET() {
  try {
    const plays = await prisma.play.findMany({
      orderBy: [
        { featuredOrder: { sort: 'asc', nulls: 'last' } },
        { title: 'asc' },
      ],
    });
    return NextResponse.json(plays);
  } catch (error) {
    console.error('GET /api/plays error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' },
      },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validationError = validatePlay(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const play = await prisma.play.create({
      data: {
        slug: (body.slug as string).trim(),
        title: (body.title as string).trim(),
        category: body.category as string,
        runtime: (body.runtime as string).trim(),
        cast: (body.cast as string).trim(),
        synopsis: (body.synopsis as string).trim(),
        imageSrc: (body.imageSrc as string).trim(),
        pdfSrc: typeof body.pdfSrc === 'string' ? body.pdfSrc : '',
        purchase: typeof body.purchase === 'string' ? body.purchase : '',
        published: typeof body.published === 'boolean' ? body.published : false,
        featured: typeof body.featured === 'boolean' ? body.featured : false,
        featuredOrder:
          typeof body.featuredOrder === 'number' ? body.featuredOrder : null,
      },
    });
    return NextResponse.json(play, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A play with this slug already exists' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
