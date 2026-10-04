import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { revalidatePlays, revalidateProductions } from '@/lib/revalidate';

beforeEach(() => {
  vi.mocked(revalidatePath).mockReset();
});

describe('revalidatePlays', () => {
  it('revalidates the shared pages plus each slug page and API route', () => {
    revalidatePlays('a', 'b');
    const paths = vi.mocked(revalidatePath).mock.calls.map((c) => c[0]);
    expect(paths).toEqual(
      expect.arrayContaining(['/', '/works', '/api/plays', '/works/a', '/api/plays/a', '/works/b', '/api/plays/b'])
    );
  });

  it('dedupes slugs and ignores undefined', () => {
    revalidatePlays('a', 'a', undefined);
    const paths = vi.mocked(revalidatePath).mock.calls.map((c) => c[0]);
    expect(paths.filter((p) => p === '/works/a')).toHaveLength(1);
    expect(paths).not.toContain('/works/undefined');
  });

  it('never throws when revalidation fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('boom');
    });
    expect(() => revalidatePlays('a')).not.toThrow();
  });
});

describe('revalidateProductions', () => {
  it('revalidates the productions page and API', () => {
    revalidateProductions();
    expect(vi.mocked(revalidatePath).mock.calls.map((c) => c[0])).toEqual(['/productions', '/api/productions']);
  });
});
