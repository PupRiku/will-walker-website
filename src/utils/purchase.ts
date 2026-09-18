import type { Work } from '@/types/play';
import { isHttpUrl } from '@/utils/url';

/**
 * Returns the play's purchase URL if it is published and the stored value is a
 * usable http(s) URL, otherwise null. Values saved before the admin form
 * validated this field may be blank or stray text, and those must not count as
 * "available from a publisher" — that would render a broken Purchase Rights
 * link and hide Request Perusal.
 */
export function getPurchaseUrl(work: Pick<Work, 'published' | 'purchase'>): string | null {
  if (!work.published) return null;
  const value = work.purchase?.trim();
  if (!value) return null;
  return isHttpUrl(value) ? value : null;
}
