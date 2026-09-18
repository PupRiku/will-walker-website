import type { Work } from '@/types/play';

/**
 * Returns the play's purchase URL if it is published and the stored value is a
 * usable http(s) URL, otherwise null. The admin form saves `purchase` verbatim,
 * so whitespace or stray text must not count as "available from a publisher" —
 * that would render a broken Purchase Rights link and hide Request Perusal.
 */
export function getPurchaseUrl(work: Pick<Work, 'published' | 'purchase'>): string | null {
  if (!work.published) return null;
  const value = work.purchase?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}
