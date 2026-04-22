import { test, expect } from '@playwright/test';

test.describe('CV page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv');
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
    await expect(
      page.getByRole('heading', { name: /playwriting/i }),
    ).toBeVisible();
  });

  test('"Directing Portfolio" section is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /directing portfolio/i }),
    ).toBeVisible();
  });

  test('"Hamlet: A Horatio Story" is listed under Playwriting', async ({
    page,
  }) => {
    const hamletEntry = page.getByText(/Hamlet: A Horatio Story/);
    await expect(hamletEntry).toBeAttached({ timeout: 10000 });
    await hamletEntry.scrollIntoViewIfNeeded();
    await expect(hamletEntry).toBeVisible();
  });
});
