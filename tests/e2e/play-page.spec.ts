import { test, expect } from '@playwright/test';
import { HAMLET_SLUG, ECHOES_SLUG } from './fixtures/plays';

test.describe('/works/hamlet-a-horatio-story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/works/${HAMLET_SLUG}`);
  });

  test('loads with correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Hamlet.*Horatio.*William L\. Walker Montgomerie/i);
  });

  test('"PUBLISHED" badge is visible', async ({ page }) => {
    await expect(page.getByText(/published/i).first()).toBeVisible();
  });

  test('cover image renders without error', async ({ page }) => {
    const img = page.getByRole('img').first();
    await expect(img).toBeVisible();
    // Verify the image loaded correctly (no broken image)
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('genre tag "Drama" is visible', async ({ page }) => {
    await expect(page.getByText(/drama/i).first()).toBeVisible();
  });

  test('runtime "90-120 minutes" is visible', async ({ page }) => {
    await expect(page.getByText(/90.120 minutes/i)).toBeVisible();
  });

  test('"Read Sample" button is present and has correct href', async ({ page }) => {
    const link = page.getByRole('link', { name: /read sample/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/nextstagepress\.com/);
  });

  test('"Purchase Rights" button is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /purchase rights/i })).toBeVisible();
  });

  test('"Download Royalties Scale" button is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /royalties scale/i })).toBeVisible();
  });

  test('"← Back to All Works" link navigates to /works', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back to all works/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/works');
  });
});

test.describe('/works/echoes-of-valor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/works/${ECHOES_SLUG}`);
  });

  test('loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Echoes of Valor.*William L\. Walker Montgomerie/i);
  });

  test('no "PUBLISHED" badge on Echoes of Valor', async ({ page }) => {
    await expect(page.getByText(/^published$/i)).not.toBeVisible();
  });

  test('"Apply for Performance Rights" button is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /apply for performance rights/i })).toBeVisible();
  });

  test('no "Purchase Rights" button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /purchase rights/i })).not.toBeVisible();
  });
});

test.describe('404 for unknown slug', () => {
  test('/works/this-does-not-exist returns a 404 page', async ({ page }) => {
    const response = await page.goto('/works/this-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
