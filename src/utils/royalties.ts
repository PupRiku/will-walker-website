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
