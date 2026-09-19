import type { Work } from '@/types/play';

/**
 * Published plays are licensed through a publisher, so the flat royalties
 * scale doesn't apply and the button is always hidden regardless of the
 * stored toggle. Otherwise it follows the admin's "Show Royalties Scale
 * Button" toggle, defaulting on for plays saved before the field existed.
 */
export function shouldShowRoyaltiesButton(
  work: Pick<Work, 'published' | 'showRoyaltiesButton'>,
): boolean {
  if (work.published) return false;
  return work.showRoyaltiesButton !== false;
}

/**
 * Server-side counterpart to the display rule above: a published play must
 * never persist `showRoyaltiesButton: true`, regardless of what a client
 * sends (the admin form force-disables the toggle, but that's a UI nicety,
 * not an enforcement boundary — a direct API call, or a row published
 * before this field existed, must not be able to bypass it).
 */
export function normalizeShowRoyaltiesButton(
  published: boolean,
  requested: boolean,
): boolean {
  return published ? false : requested;
}
