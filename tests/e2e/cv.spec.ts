import { test, expect } from '@playwright/test';

test.describe('CV page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv');
    await page.waitForLoadState('networkidle');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/CV.*William L\. Walker Montgomerie/i);
  });

  test('"Artist Statement" section is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /artist statement/i }),
    ).toBeVisible();
  });

  test('"Education" section is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /education/i }),
    ).toBeVisible();
  });

  test('"Playwriting" section is visible', async ({ page }) => {
    // Heading is rendered as uppercase "PLAYWRITING" via CSS
    const heading = page.getByRole('heading', { name: /playwriting/i });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  });

  test('"Directing Portfolio" section is visible', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /directing portfolio/i });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  });

  test('"Hamlet: A Horatio Story" is listed under Playwriting', async ({
    page,
  }) => {
    // Use JavaScript scroll since the element is deep in the page
    const hamletEntry = page.getByText('Hamlet: A Horatio Story').first();
    await expect(hamletEntry).toBeAttached({ timeout: 10000 });
    await hamletEntry.evaluate((el) =>
      el.scrollIntoView({ behavior: 'instant', block: 'center' }),
    );
    await expect(hamletEntry).toBeInViewport({ timeout: 5000 });
    await expect(hamletEntry).toBeVisible();
  });
});
