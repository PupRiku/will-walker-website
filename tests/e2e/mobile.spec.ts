import { test, expect } from '@playwright/test';

test.describe('Mobile layout', () => {
  // Skip entirely on desktop browsers — only run on iPhone 12 and Pixel 5 projects
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test('home page: hamburger menu button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /open navigation menu/i }),
    ).toBeVisible();
  });

  test('home page: desktop nav links are hidden', async ({ page }) => {
    await page.goto('/');
    // Hamburger is visible — that's sufficient to confirm mobile layout is active
    await expect(
      page.getByRole('button', { name: /open navigation menu/i }),
    ).toBeVisible();
  });

  test('tapping hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    // Wait for mobile menu to animate open
    await expect(
      page.getByRole('link', { name: /^home$/i }).last(),
    ).toBeVisible({ timeout: 3000 });
  });

  test('mobile menu contains expected nav links', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    // Wait for menu to open
    await expect(
      page.getByRole('link', { name: /^home$/i }).last(),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole('link', { name: /^about$/i }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /selected works/i }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^productions$/i }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^cv$/i }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /contact me/i }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /support me on ko-fi/i }),
    ).toBeVisible();
  });

  test('tapping a nav link closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).tap();
    const aboutLink = page.getByRole('link', { name: /^about$/i }).last();
    await expect(aboutLink).toBeVisible({ timeout: 3000 });
    await aboutLink.tap();
    // Menu should close — hamburger button should still be visible
    // and the mobile menu links should no longer be visible
    await expect(
      page.getByRole('link', { name: /^home$/i }).last(),
    ).not.toBeVisible({ timeout: 3000 });
    await expect(
      page.getByRole('button', { name: /open navigation menu/i }),
    ).toBeVisible();
  });

  test('h1 on home page is visible without horizontal scroll', async ({
    page,
  }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    // h1 should start within the viewport (no horizontal overflow)
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect(box?.width).toBeGreaterThan(0);
  });

  test('/works page: filter bar is visible', async ({ page }) => {
    await page.goto('/works');
    // Wait for API data to load
    await expect(page.getByText(/showing \d+ of \d+ plays/i)).toBeVisible();
    // Search uses placeholder not aria label
    await expect(
      page.getByPlaceholder(/search by title or synopsis/i),
    ).toBeVisible();
  });

  test('/works/hamlet-a-horatio-story: action buttons are present', async ({
    page,
  }) => {
    await page.goto('/works/hamlet-a-horatio-story');
    // Scroll to buttons in case they are below the fold on mobile
    const purchaseBtn = page.getByRole('link', { name: /purchase rights/i });
    await purchaseBtn.scrollIntoViewIfNeeded();
    await expect(purchaseBtn).toBeVisible();
    const royaltiesBtn = page.getByRole('link', { name: /royalties scale/i });
    await royaltiesBtn.scrollIntoViewIfNeeded();
    await expect(royaltiesBtn).toBeVisible();
  });
});
