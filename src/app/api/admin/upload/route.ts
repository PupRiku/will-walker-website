import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  ERROR_MESSAGES,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_ERRORS,
} from '@/lib/constants';

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="WLW Admin"' } }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: UPLOAD_ERRORS.WRONG_TYPE },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: UPLOAD_ERRORS.TOO_LARGE }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `covers/${crypto.randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
