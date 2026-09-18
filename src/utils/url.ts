/** True when `value` parses as an absolute http(s) URL. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function urlFieldError(label: string): string {
  return `${label} must be a full web address starting with https:// (or leave it blank)`;
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
