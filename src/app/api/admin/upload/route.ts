import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, and WEBP files are allowed' },
      { status: 400 }
    );
  }

  const MAX_BYTES = 4 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be under 4MB' }, { status: 400 });
  }

  const timestamp = Date.now();
  const pathname = `covers/${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const blob = await put(pathname, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
