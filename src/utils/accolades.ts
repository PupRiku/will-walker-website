import type { Accolade } from '@/types/play';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MAX_ACCOLADES = 50;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/** Newest first: year desc, then month desc. Does not mutate the input. */
export function sortAccolades(accolades: Accolade[] | undefined | null): Accolade[] {
  return [...(accolades ?? [])].sort((a, b) => b.year - a.year || b.month - a.month);
}

/** e.g. `{ month: 6, year: 2024 }` -> "June 2024" */
export function formatAccoladeDate(accolade: Pick<Accolade, 'month' | 'year'>): string {
  return `${MONTH_NAMES[accolade.month - 1] ?? ''} ${accolade.year}`.trim();
}

/**
 * Validates an optional accolades array from a request body. Returns an error
 * message or null. `undefined` is allowed (the field is optional); shared by
 * the play API routes so a direct API call can't persist malformed rows.
 */
export function validateAccolades(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return 'accolades must be an array';
  if (value.length > MAX_ACCOLADES) return `accolades cannot exceed ${MAX_ACCOLADES} entries`;

  for (const item of value) {
    if (!item || typeof item !== 'object') return 'each accolade must be an object';
    const { name, organization, month, year } = item as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim()) return 'each accolade needs an award name';
    if (typeof organization !== 'string' || !organization.trim())
      return 'each accolade needs an organization';
    if (!Number.isInteger(month) || (month as number) < 1 || (month as number) > 12)
      return 'accolade month must be between 1 and 12';
    if (!Number.isInteger(year) || (year as number) < MIN_YEAR || (year as number) > MAX_YEAR)
      return `accolade year must be between ${MIN_YEAR} and ${MAX_YEAR}`;
  }
  return null;
}

/** Strips a validated accolades array down to the fields persisted to the DB. */
export function toAccoladeCreateData(value: unknown[]): Omit<Accolade, 'id'>[] {
  return (value as Accolade[]).map((a) => ({
    name: a.name.trim(),
    organization: a.organization.trim(),
    month: a.month,
    year: a.year,
  }));
}
