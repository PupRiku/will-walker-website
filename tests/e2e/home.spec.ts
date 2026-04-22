import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('William L. Walker Montgomerie | Playwright, Director, Educator');
  });

  test('hero section renders with Will\'s name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /William L\. Walker Montgomerie/i })).toBeVisible();
  });

  test('about section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });

  test('selected works carousel is visible', async ({ page }) => {
    const carousel = page.locator('[class*="playsSection"], [class*="carousel"], [class*="embla"]').first();
    await expect(carousel).toBeVisible();
  });

  test('at least one carousel slide is visible', async ({ page }) => {
    // Carousel slides contain play cards
    const slides = page.locator('[class*="slide"], [class*="card"]').first();
    await expect(slides).toBeVisible();
  });

  test('clicking a carousel card opens the modal', async ({ page }) => {
    // Click the first play card in the carousel
    const card = page.locator('[class*="plays"] [class*="card"], [class*="carousel"] [class*="card"], [class*="slide"] button, [class*="plays"] button').first();
    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('modal shows title and synopsis', async ({ page }) => {
    const card = page.locator('[class*="plays"] [class*="card"], [class*="carousel"] [class*="card"], [class*="slide"] button, [class*="plays"] button').first();
    await card.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Modal should contain at least a heading and some paragraph text
    await expect(dialog.locator('h2, h3').first()).toBeVisible();
    await expect(dialog.locator('p').first()).toBeVisible();
  });

  test('modal has "View Full Page →" link', async ({ page }) => {
    const card = page.locator('[class*="plays"] [class*="card"], [class*="carousel"] [class*="card"], [class*="slide"] button, [class*="plays"] button').first();
    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('link', { name: /view full page/i })).toBeVisible();
  });

  test('closing modal with × button works', async ({ page }) => {
    const card = page.locator('[class*="plays"] [class*="card"], [class*="carousel"] [class*="card"], [class*="slide"] button, [class*="plays"] button').first();
    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closing modal by clicking backdrop works', async ({ page }) => {
    const card = page.locator('[class*="plays"] [class*="card"], [class*="carousel"] [class*="card"], [class*="slide"] button, [class*="plays"] button').first();
    await card.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Click the overlay (outside the modal panel)
    const overlay = page.locator('[class*="overlay"]');
    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(dialog).not.toBeVisible();
  });

  test('"See all of Will\'s work →" link navigates to /works', async ({ page }) => {
    const link = page.getByRole('link', { name: /see all of will/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL('/works');
  });

  test('contact form section is visible with Name, Email, Message fields', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
  });

  test('footer renders with copyright text and CV link', async ({ page }) => {
    await expect(page.getByText(/William L\. Walker/)).toBeVisible();
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /cv/i })).toBeVisible();
  });

  test('social icons in footer are present (at least 3)', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    const socialLinks = footer.getByRole('link');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
