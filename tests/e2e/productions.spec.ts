import { test, expect } from '@playwright/test';

test.describe('Productions page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/productions');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Productions.*William L\. Walker Montgomerie/i);
  });

  test('at least 2 production groups are visible', async ({ page }) => {
    const headings = page.getByRole('heading', { level: 2 });
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('"Echoes of Valor" group heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /echoes of valor/i })).toBeVisible();
  });

  test('"Paris Community Theatre" venue text is visible', async ({ page }) => {
    await expect(page.getByText(/paris community theatre/i).first()).toBeVisible();
  });

  test('"The Squatch of Avon" group heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /squatch of avon/i })).toBeVisible();
  });

  test('"Grayson College" venue text is visible', async ({ page }) => {
    await expect(page.getByText(/grayson college/i).first()).toBeVisible();
  });

  test('at least 2 photos visible in Echoes of Valor group', async ({ page }) => {
    const eovSection = page.locator('section, [class*="group"]').filter({
      has: page.getByRole('heading', { name: /echoes of valor/i }),
    }).first();
    const count = await eovSection.getByRole('img').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('at least 9 photos visible in Squatch of Avon group', async ({ page }) => {
    const squatchSection = page.locator('section, [class*="group"]').filter({
      has: page.getByRole('heading', { name: /squatch of avon/i }),
    }).first();
    const count = await squatchSection.getByRole('img').count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('photo images load correctly (not broken)', async ({ page }) => {
    const images = page.getByRole('img').first();
    await expect(images).toBeVisible();
    const naturalWidth = await images.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('caption "First table read at Paris Community Theatre" is visible', async ({ page }) => {
    await expect(page.getByText(/first table read at paris community theatre/i)).toBeVisible();
  });
});
