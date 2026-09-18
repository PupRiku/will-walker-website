import { describe, it, expect } from 'vitest';
import { getPurchaseUrl } from '@/utils/purchase';

describe('getPurchaseUrl', () => {
  it('returns the URL for a published play with an https purchase link', () => {
    expect(getPurchaseUrl({ published: true, purchase: 'https://example.com/buy' })).toBe(
      'https://example.com/buy'
    );
  });

  it('accepts http links', () => {
    expect(getPurchaseUrl({ published: true, purchase: 'http://example.com/buy' })).toBe(
      'http://example.com/buy'
    );
  });

  it('trims surrounding whitespace', () => {
    expect(getPurchaseUrl({ published: true, purchase: '  https://example.com/buy \n' })).toBe(
      'https://example.com/buy'
    );
  });

  it('returns null for unpublished plays even with a valid URL', () => {
    expect(getPurchaseUrl({ published: false, purchase: 'https://example.com/buy' })).toBeNull();
    expect(getPurchaseUrl({ purchase: 'https://example.com/buy' })).toBeNull();
  });

  it('returns null for missing, empty or whitespace-only values', () => {
    expect(getPurchaseUrl({ published: true })).toBeNull();
    expect(getPurchaseUrl({ published: true, purchase: '' })).toBeNull();
    expect(getPurchaseUrl({ published: true, purchase: '   ' })).toBeNull();
  });

  it('returns null for text that is not a URL', () => {
    expect(getPurchaseUrl({ published: true, purchase: 'TBD' })).toBeNull();
    expect(getPurchaseUrl({ published: true, purchase: 'example.com/buy' })).toBeNull();
  });

  it('returns null for scheme shorthand like https:example.com', () => {
    expect(getPurchaseUrl({ published: true, purchase: 'https:example.com/buy' })).toBeNull();
  });

  it('returns null for non-http(s) schemes', () => {
    expect(getPurchaseUrl({ published: true, purchase: 'javascript:alert(1)' })).toBeNull();
    expect(getPurchaseUrl({ published: true, purchase: 'mailto:someone@example.com' })).toBeNull();
  });
});
