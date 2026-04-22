import { test, expect } from '@playwright/test';

test.describe('Works page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/works');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/All Works.*William L\. Walker Montgomerie/i);
  });

  test('shows "Showing 60 of 60 plays" count on load', async ({ page }) => {
    await expect(page.getByText(/showing 60 of 60 plays/i)).toBeVisible();
  });

  test('search input is present', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
  });

  test('Genre, Runtime, Cast Size filter controls are present', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: /genre/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /runtime/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /cast size/i })).toBeVisible();
  });

  test('Published works only checkbox is present', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: /published/i })).toBeVisible();
  });

  test('typing "hamlet" in search filters results', async ({ page }) => {
    const search = page.getByRole('textbox', { name: /search/i });
    await search.fill('hamlet');
    const countText = page.getByText(/showing \d+ of 60 plays/i);
    await expect(countText).toBeVisible();
    // Count should be less than 60
    const text = await countText.textContent();
    const match = text?.match(/showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('clearing search restores all 60 plays', async ({ page }) => {
    const search = page.getByRole('textbox', { name: /search/i });
    await search.fill('hamlet');
    await search.clear();
    await expect(page.getByText(/showing 60 of 60 plays/i)).toBeVisible();
  });

  test('selecting genre "Drama" filters results', async ({ page }) => {
    await page.getByRole('combobox', { name: /genre/i }).selectOption('Drama');
    const countText = page.getByText(/showing \d+ of 60 plays/i);
    await expect(countText).toBeVisible();
    const text = await countText.textContent();
    const match = text?.match(/showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('checking "Published works only" shows exactly 2 plays', async ({ page }) => {
    await page.getByRole('checkbox', { name: /published/i }).check();
    await expect(page.getByText(/showing 2 of 60 plays/i)).toBeVisible();
  });

  test('selecting Sort "Title: A → Z" changes order', async ({ page }) => {
    const sortSelect = page.getByRole('combobox', { name: /sort/i });
    // Get first option value for default order, then switch to A→Z
    await sortSelect.selectOption('title-asc');
    // First card should begin alphabetically early
    const firstCard = page.locator('a[href^="/works/"]').first();
    const title = await firstCard.textContent();
    // Title should start with a letter in the early alphabet (before M)
    expect(title!.trim()[0].toUpperCase() < 'M').toBeTruthy();
  });

  test('clicking a play card navigates to /works/[slug]', async ({ page }) => {
    const firstCard = page.locator('a[href^="/works/"]').first();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(href!);
    expect(page.url()).toMatch(/\/works\/.+/);
  });

  test('casting note icon opens the casting flexibility modal', async ({ page }) => {
    const castingBtn = page.getByRole('button', { name: /casting/i });
    await castingBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Download Royalties Scale button is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /royalties scale/i })).toBeVisible();
  });

  test('Apply for Performance Rights button is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: /performance rights/i })).toBeVisible();
  });
});
