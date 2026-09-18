import type { Work } from '@/types/play';

export const PURCHASE_URL_ERROR =
  'Purchase URL must be a full web address starting with https:// (or leave it blank)';

/** True when `value` parses as an absolute http(s) URL. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates the admin Purchase URL field. Blank is allowed (not every play has
 * a publisher); anything else must be an http(s) URL. Returns an error message
 * or null. Shared by the admin form and the play API routes.
 */
export function validatePurchaseUrl(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return PURCHASE_URL_ERROR;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isHttpUrl(trimmed) ? null : PURCHASE_URL_ERROR;
}

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
  return isHttpUrl(value) ? value : null;
}
