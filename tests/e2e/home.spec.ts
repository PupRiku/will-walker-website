import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(
      'William L. Walker Montgomerie | Playwright, Director, Educator',
    );
  });

  test("hero section renders with Will's name", async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /William L\. Walker Montgomerie/i }),
    ).toBeVisible();
  });

  test('about section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });

  test('selected works carousel is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /selected works/i }),
    ).toBeVisible();
  });

  test('at least one carousel slide is visible', async ({ page }) => {
    // Carousel slides are buttons inside the #plays section
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
  });

  test('clicking a carousel card opens the modal', async ({ page }) => {
    // Wait for carousel to initialise then click first slide button
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
    await firstSlide.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('modal shows title and synopsis', async ({ page }) => {
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
    await firstSlide.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('h2').first()).toBeVisible();
    await expect(dialog.locator('p').first()).toBeVisible();
  });

  test('modal has "View Full Page →" link', async ({ page }) => {
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
    await firstSlide.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /view full page/i }),
    ).toBeVisible();
  });

  test('closing modal with × button works', async ({ page }) => {
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
    await firstSlide.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Close button has aria-label="Close dialog"
    await page.getByRole('button', { name: /close dialog/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closing modal by clicking backdrop works', async ({ page }) => {
    const firstSlide = page.locator('#plays button').first();
    await expect(firstSlide).toBeVisible();
    await firstSlide.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Click top-left corner of the dialog overlay (which is the backdrop)
    await page.getByRole('dialog').click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('"See all of Will\'s work →" link navigates to /works', async ({
    page,
  }) => {
    const link = page.getByRole('link', { name: /see all of will/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL('/works');
  });

  test('contact form section is visible with Name, Email, Message fields', async ({
    page,
  }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
  });

  test('footer renders with copyright text and CV link', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/William L\. Walker/i)).toBeVisible();
    await expect(footer.getByRole('link', { name: /^cv$/i })).toBeVisible();
  });

  test('social icons in footer are present (at least 3)', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    const socialLinks = footer.getByRole('link');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
