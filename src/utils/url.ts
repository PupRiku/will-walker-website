/**
 * True when `value` is written out as an absolute http(s) URL. The explicit
 * prefix check matters: `new URL()` also accepts shorthand like
 * `https:example.com` or `https:\example.com` and normalises it, but the raw
 * string is what gets stored and rendered, and a browser resolves those forms
 * relative to the current page instead of to the intended site.
 */
export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function urlFieldError(label: string): string {
  return `${label} must be a full web address starting with https:// or http:// (or leave it blank)`;
}

/**
 * Validates an optional URL field from the admin play form (Purchase URL,
 * Sample PDF URL). Blank is allowed; anything else must be an http(s) URL.
 * Returns an error message naming the field, or null. Shared by the admin form
 * and the play API routes so both apply the same rule.
 */
export function validateOptionalHttpUrl(value: unknown, label: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return urlFieldError(label);
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isHttpUrl(trimmed) ? null : urlFieldError(label);
}
