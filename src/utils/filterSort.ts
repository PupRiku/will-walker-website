import { Work } from '@/data/works';

export type RuntimeBucket = '' | 'short' | 'medium' | 'long' | 'full';
export type CastBucket = '' | 'small' | 'medium' | 'large';
export type SortOrder =
  | ''
  | 'title-asc'
  | 'title-desc'
  | 'runtime-asc'
  | 'runtime-desc'
  | 'cast-asc'
  | 'cast-desc';

export function classifyRuntime(
  runtime: string | undefined
): 'short' | 'medium' | 'long' | 'full' | null {
  if (!runtime) return null;
  if (runtime === 'Full Length') return 'full';
  const match = runtime.match(/\d+/);
  if (!match) return null;
  const minutes = parseInt(match[0], 10);
  if (minutes < 30) return 'short';
  if (minutes < 60) return 'medium';
  return 'long';
}

export function parseCastSize(cast: string): number | null {
  if (!cast) return null;
  if (/flexible|various|ensemble/i.test(cast)) return null;
  const numbers = cast.match(/\d+/g);
  if (!numbers) return null;
  return numbers.reduce((sum, n) => sum + parseInt(n, 10), 0);
}

export function parseRuntimeForSort(runtime: string | undefined): number {
  if (!runtime || runtime === 'TBD' || runtime === 'Collection') return Infinity;
  const match = runtime.match(/\d+/);
  if (!match) return Infinity;
  return parseInt(match[0], 10);
}

export function parseCastForSort(cast: string): number {
  if (!cast || cast === 'TBD') return Infinity;
  const matches = [...cast.matchAll(/(\d+)\s*(?:NB|V\.O\.|VO|[MF])(?![a-zA-Z])/g)];
  if (matches.length === 0) return Infinity;
  return matches.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
}

export interface FilterOptions {
  searchQuery: string;
  selectedGenre: string;
  publishedOnly: boolean;
  runtimeBucket: RuntimeBucket;
  castBucket: CastBucket;
}

export function filterWorks(works: Work[], opts: FilterOptions): Work[] {
  const q = opts.searchQuery.toLowerCase();
  return works.filter((work) => {
    const matchesSearch =
      work.title.toLowerCase().includes(q) ||
      work.synopsis.toLowerCase().includes(q);
    const matchesGenre =
      opts.selectedGenre === '' || work.category === opts.selectedGenre;
    const matchesPublished = !opts.publishedOnly || work.published === true;

    const matchesRuntime = (() => {
      if (opts.runtimeBucket === '') return true;
      const bucket = classifyRuntime(work.runtime);
      return bucket === null || bucket === opts.runtimeBucket;
    })();

    const matchesCast = (() => {
      if (opts.castBucket === '') return true;
      const size = parseCastSize(work.cast);
      if (size === null) return true;
      if (opts.castBucket === 'small') return size <= 5;
      if (opts.castBucket === 'medium') return size >= 6 && size <= 12;
      return size >= 13;
    })();

    return matchesSearch && matchesGenre && matchesPublished && matchesRuntime && matchesCast;
  });
}

export function sortWorks(works: Work[], sortOrder: SortOrder): Work[] {
  if (sortOrder === '') return works;
  const sorted = [...works];
  if (sortOrder === 'title-asc') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === 'title-desc') {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortOrder === 'runtime-asc') {
    sorted.sort((a, b) => parseRuntimeForSort(a.runtime) - parseRuntimeForSort(b.runtime));
  } else if (sortOrder === 'runtime-desc') {
    sorted.sort((a, b) => parseRuntimeForSort(b.runtime) - parseRuntimeForSort(a.runtime));
  } else if (sortOrder === 'cast-asc') {
    sorted.sort((a, b) => parseCastForSort(a.cast) - parseCastForSort(b.cast));
  } else if (sortOrder === 'cast-desc') {
    sorted.sort((a, b) => parseCastForSort(b.cast) - parseCastForSort(a.cast));
  }
  return sorted;
}
