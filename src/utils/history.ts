import type { HistoryEntry } from '@/types/play';
import { MONTH_NAMES } from '@/utils/accolades';

export const MAX_HISTORY = 50;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/** Oldest first: year asc, then month asc. Does not mutate the input. */
export function sortHistory(history: HistoryEntry[] | undefined | null): HistoryEntry[] {
  return [...(history ?? [])].sort((a, b) => a.year - b.year || a.month - b.month);
}

/** e.g. `{ month: 6, year: 2024 }` -> "June 2024" */
export function formatHistoryDate(entry: Pick<HistoryEntry, 'month' | 'year'>): string {
  return `${MONTH_NAMES[entry.month - 1] ?? ''} ${entry.year}`.trim();
}

/** e.g. "Staged Reading - June 2024 - Paris, TX" */
export function formatHistoryEntry(entry: HistoryEntry): string {
  return `${entry.type} - ${formatHistoryDate(entry)} - ${entry.location}`;
}

/**
 * Validates an optional history array from a request body. Returns an error
 * message or null. `undefined` is allowed (the field is optional).
 */
export function validateHistory(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return 'history must be an array';
  if (value.length > MAX_HISTORY) return `history cannot exceed ${MAX_HISTORY} entries`;

  for (const item of value) {
    if (!item || typeof item !== 'object') return 'each history entry must be an object';
    const { type, month, year, location } = item as Record<string, unknown>;
    if (typeof type !== 'string' || !type.trim()) return 'each history entry needs a type';
    if (typeof location !== 'string' || !location.trim())
      return 'each history entry needs a location';
    if (!Number.isInteger(month) || (month as number) < 1 || (month as number) > 12)
      return 'history month must be between 1 and 12';
    if (!Number.isInteger(year) || (year as number) < MIN_YEAR || (year as number) > MAX_YEAR)
      return `history year must be between ${MIN_YEAR} and ${MAX_YEAR}`;
  }
  return null;
}

/** Strips a validated history array down to the fields persisted to the DB. */
export function toHistoryCreateData(value: unknown[]): Omit<HistoryEntry, 'id'>[] {
  return (value as HistoryEntry[]).map((h) => ({
    type: h.type.trim(),
    month: h.month,
    year: h.year,
    location: h.location.trim(),
  }));
}
