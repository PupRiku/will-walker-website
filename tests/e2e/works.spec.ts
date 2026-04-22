import { test, expect } from '@playwright/test';

test.describe('Works page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/works');
    // Wait for plays to load from API
    await expect(page.getByText(/showing 60 of 60 plays/i)).toBeVisible();
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(
      /All Works.*William L\. Walker Montgomerie/i,
    );
  });

  test('shows "Showing 60 of 60 plays" count on load', async ({ page }) => {
    await expect(page.getByText(/showing 60 of 60 plays/i)).toBeVisible();
  });

  test('search input is present', async ({ page }) => {
    // Search input uses a placeholder rather than an aria label
    await expect(
      page.getByPlaceholder(/search by title or synopsis/i),
    ).toBeVisible();
  });

  test('Genre, Runtime, Cast Size filter controls are present', async ({
    page,
  }) => {
    await expect(page.getByRole('combobox').nth(0)).toBeVisible(); // Genre
    await expect(page.getByRole('combobox').nth(1)).toBeVisible(); // Runtime
    await expect(page.getByRole('combobox').nth(2)).toBeVisible(); // Cast Size
  });

  test('Published works only checkbox is present', async ({ page }) => {
    await expect(
      page.getByRole('checkbox', { name: /published/i }),
    ).toBeVisible();
  });

  test('typing "hamlet" in search filters results', async ({ page }) => {
    const search = page.getByPlaceholder(/search by title or synopsis/i);
    await search.fill('hamlet');
    // Wait for filter to apply
    await expect(page.getByText(/showing \d+ of 60 plays/i)).toBeVisible();
    const text = await page.getByText(/showing \d+ of 60 plays/i).textContent();
    const match = text?.match(/showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('clearing search restores all 60 plays', async ({ page }) => {
    const search = page.getByPlaceholder(/search by title or synopsis/i);
    await search.fill('hamlet');
    await expect(page.getByText(/showing \d+ of 60 plays/i)).toBeVisible();
    await search.clear();
    await expect(page.getByText(/showing 60 of 60 plays/i)).toBeVisible();
  });

  test('selecting genre "Drama" filters results', async ({ page }) => {
    // Genre is the first combobox
    await page.getByRole('combobox').nth(0).selectOption('Drama');
    await expect(page.getByText(/showing \d+ of 60 plays/i)).toBeVisible();
    const text = await page.getByText(/showing \d+ of 60 plays/i).textContent();
    const match = text?.match(/showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('checking "Published works only" shows exactly 2 plays', async ({
    page,
  }) => {
    await page.getByRole('checkbox', { name: /published/i }).check();
    await expect(page.getByText(/showing 2 of 60 plays/i)).toBeVisible();
  });

  test('selecting Sort "Title: A → Z" changes order', async ({ page }) => {
    // Sort is the last combobox (4th — after Genre, Runtime, Cast Size)
    await page.getByRole('combobox').last().selectOption('title-asc');
    const firstCard = page.locator('a[href^="/works/"]').first();
    await expect(firstCard).toBeVisible();
    const title = await firstCard.textContent();
    expect(title!.trim()[0].toUpperCase() < 'M').toBeTruthy();
  });

  test('clicking a play card navigates to /works/[slug]', async ({ page }) => {
    const firstCard = page.locator('a[href^="/works/"]').first();
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(href!);
    expect(page.url()).toMatch(/\/works\/.+/);
  });

  test('casting note icon opens the casting flexibility modal', async ({
    page,
  }) => {
    // Casting note button has aria-label="Note on Casting Flexibility"
    const castingBtn = page.getByRole('button', {
      name: /note on casting flexibility/i,
    });
    await castingBtn.scrollIntoViewIfNeeded();
    await expect(castingBtn).toBeVisible();
    await castingBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Download Royalties Scale button is present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /royalties scale/i }),
    ).toBeVisible();
  });

  test('Apply for Performance Rights button is present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /performance rights/i }),
    ).toBeVisible();
  });
});
