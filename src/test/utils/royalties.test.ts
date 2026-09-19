import { describe, it, expect } from 'vitest';
import { shouldShowRoyaltiesButton } from '@/utils/royalties';

describe('shouldShowRoyaltiesButton', () => {
  it('hides the button for published plays even when the toggle is on', () => {
    expect(
      shouldShowRoyaltiesButton({ published: true, showRoyaltiesButton: true }),
    ).toBe(false);
  });

  it('hides the button for unpublished plays when the toggle is off', () => {
    expect(
      shouldShowRoyaltiesButton({ published: false, showRoyaltiesButton: false }),
    ).toBe(false);
  });

  it('shows the button for unpublished plays when the toggle is on', () => {
    expect(
      shouldShowRoyaltiesButton({ published: false, showRoyaltiesButton: true }),
    ).toBe(true);
  });

  it('defaults to showing the button for legacy records missing the toggle', () => {
    expect(
      shouldShowRoyaltiesButton({ published: false, showRoyaltiesButton: undefined }),
    ).toBe(true);
  });
});
