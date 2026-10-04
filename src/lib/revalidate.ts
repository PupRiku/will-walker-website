import { revalidatePath } from 'next/cache';

// Admin writes call these so the public site reflects a save immediately
// instead of waiting out the 60s ISR window (and the CDN-cached API responses
// that /works reads client-side). A failed revalidation must never fail a save
// that already succeeded, so errors are logged and swallowed — the 60s
// `revalidate` on each page remains the fallback.
function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error(`revalidatePath(${path}) failed:`, error);
    }
  }
}

/** Plays changed: home carousel, /works, the API lists, and each affected play page. */
export function revalidatePlays(...slugs: Array<string | undefined>) {
  const uniqueSlugs = [...new Set(slugs.filter((s): s is string => Boolean(s)))];
  revalidatePaths([
    '/',
    '/works',
    '/api/plays',
    ...uniqueSlugs.flatMap((slug) => [`/works/${slug}`, `/api/plays/${slug}`]),
  ]);
}

/** Production photos/groups changed. */
export function revalidateProductions() {
  revalidatePaths(['/productions', '/api/productions']);
}
