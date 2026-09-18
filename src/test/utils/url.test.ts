import { describe, it, expect } from 'vitest';
import { isHttpUrl, urlFieldError, validateOptionalHttpUrl } from '@/utils/url';

describe('isHttpUrl', () => {
  it('accepts absolute http and https URLs', () => {
    expect(isHttpUrl('https://drive.google.com/file/d/abc/view')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
  });

  it('rejects relative paths, bare domains and other schemes', () => {
    expect(isHttpUrl('/pdfs/sample.pdf')).toBe(false);
    expect(isHttpUrl('www.example.com')).toBe(false);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('mailto:someone@example.com')).toBe(false);
  });
});

describe('validateOptionalHttpUrl', () => {
  it('allows blank values', () => {
    expect(validateOptionalHttpUrl(undefined, 'Purchase URL')).toBeNull();
    expect(validateOptionalHttpUrl(null, 'Purchase URL')).toBeNull();
    expect(validateOptionalHttpUrl('', 'Purchase URL')).toBeNull();
    expect(validateOptionalHttpUrl('   ', 'Purchase URL')).toBeNull();
  });

  it('allows http(s) URLs, with or without surrounding whitespace', () => {
    expect(validateOptionalHttpUrl('https://www.nextstagepress.com/r-u-r/', 'Purchase URL')).toBeNull();
    expect(validateOptionalHttpUrl('http://example.com', 'Purchase URL')).toBeNull();
    expect(validateOptionalHttpUrl('  https://drive.google.com/x  ', 'Sample PDF URL')).toBeNull();
  });

  it('rejects text that is not a full http(s) URL, naming the field', () => {
    expect(validateOptionalHttpUrl('TBD', 'Purchase URL')).toBe(urlFieldError('Purchase URL'));
    expect(validateOptionalHttpUrl('www.example.com/buy', 'Purchase URL')).toBe(urlFieldError('Purchase URL'));
    expect(validateOptionalHttpUrl('drive.google.com/x', 'Sample PDF URL')).toBe(urlFieldError('Sample PDF URL'));
    expect(validateOptionalHttpUrl('javascript:alert(1)', 'Sample PDF URL')).toBe(urlFieldError('Sample PDF URL'));
  });

  it('rejects non-string values', () => {
    expect(validateOptionalHttpUrl(42, 'Purchase URL')).toBe(urlFieldError('Purchase URL'));
    expect(validateOptionalHttpUrl({}, 'Sample PDF URL')).toBe(urlFieldError('Sample PDF URL'));
  });

  it('builds a readable message', () => {
    expect(urlFieldError('Sample PDF URL')).toBe(
      'Sample PDF URL must be a full web address starting with https:// (or leave it blank)'
    );
  });
});
