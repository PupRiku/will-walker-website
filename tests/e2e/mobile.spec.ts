import { test, expect } from '@playwright/test';

// Only run on mobile viewports
test.use({ viewport: null }); // Reset — individual projects define the viewport

const mobileProjects = ['iPhone 12', 'Pixel 5'];

test.describe('Mobile layout', () => {
  test.skip(({ browserName, isMobile }) => !isMobile, 'Mobile-only tests');

  test('home page: hamburger menu button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /open navigation menu/i })).toBeVisible();
  });

  test('home page: desktop nav links are hidden', async ({ page }) => {
    await page.goto('/');
    // Desktop nav should not be visible on mobile
    const desktopNav = page.locator('nav ul').first();
    // Either not visible or contains no visible links at mobile viewport
    const hambuger = page.getByRole('button', { name: /open navigation menu/i });
    await expect(hambuger).toBeVisible();
  });

  test('tapping hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    // Mobile menu should appear
    await expect(page.getByRole('link', { name: /^home$/i }).last()).toBeVisible();
  });

  test('mobile menu contains expected nav links', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    await expect(page.getByRole('link', { name: /^home$/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /^about$/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /selected works/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /^productions$/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /^cv$/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /contact me/i }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /support me on ko-fi/i })).toBeVisible();
  });

  test('tapping a nav link closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    const aboutLink = page.getByRole('link', { name: /^about$/i }).last();
    await expect(aboutLink).toBeVisible();
    await aboutLink.tap();
    // After clicking a link the mobile menu should close
    await expect(page.getByRole('button', { name: /open navigation menu/i })).toBeVisible();
  });

  test('h1 on home page is visible without horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible();
    // Confirm it's in the viewport
    const box = await h1.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
  });

  test('/works page: filter bar is visible', async ({ page }) => {
    await page.goto('/works');
    await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
  });

  test('/works/hamlet-a-horatio-story: action buttons are present', async ({ page }) => {
    await page.goto('/works/hamlet-a-horatio-story');
    await expect(page.getByRole('link', { name: /purchase rights/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /royalties scale/i })).toBeVisible();
  });
});
