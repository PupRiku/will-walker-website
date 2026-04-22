import { test, expect } from '@playwright/test';

test.describe('Works page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/works');
    await expect(page.getByText('Showing 60 of 60 plays')).toBeVisible({
      timeout: 10000,
    });
    await page.waitForLoadState('networkidle');
  });

  test('search input is present', async ({ page }) => {
    await expect(
      page.getByRole('searchbox', { name: /search plays/i }),
    ).toBeVisible();
  });

  test('typing "hamlet" in search filters results', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: /search plays/i });
    await expect(search).toBeVisible();
    await search.fill('hamlet');
    await expect(page.getByText('Showing 60 of 60 plays')).not.toBeVisible();
    await expect(page.getByText(/Showing \d+ of 60 plays/)).toBeVisible();
    const text = await page.getByText(/Showing \d+ of 60 plays/).textContent();
    const match = text?.match(/Showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('clearing search restores all 60 plays', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: /search plays/i });
    await search.fill('hamlet');
    await expect(page.getByText('Showing 60 of 60 plays')).not.toBeVisible();
    await search.clear();
    await expect(page.getByText('Showing 60 of 60 plays')).toBeVisible();
  });

  test('Genre, Runtime, Cast Size filter controls are present', async ({
    page,
  }) => {
    await expect(
      page.getByRole('combobox', { name: /filter by genre/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: /filter by runtime/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: /filter by cast size/i }),
    ).toBeVisible();
  });

  test('selecting genre "Drama" filters results', async ({ page }) => {
    const genreSelect = page.getByRole('combobox', {
      name: /filter by genre/i,
    });
    await expect(genreSelect).toBeVisible();
    await genreSelect.selectOption('Drama');
    await expect(page.getByText('Showing 60 of 60 plays')).not.toBeVisible();
    await expect(page.getByText(/Showing \d+ of 60 plays/)).toBeVisible();
    const text = await page.getByText(/Showing \d+ of 60 plays/).textContent();
    const match = text?.match(/Showing (\d+)/);
    expect(Number(match?.[1])).toBeLessThan(60);
  });

  test('checking "Published works only" shows exactly 2 plays', async ({
    page,
  }) => {
    await page.getByRole('checkbox', { name: /published/i }).check();
    await expect(page.getByText('Showing 2 of 60 plays')).toBeVisible();
  });

  test('selecting Sort "Title: A → Z" changes order', async ({ page }) => {
    await page
      .getByRole('combobox', { name: /sort by/i })
      .selectOption('title-asc');
    const firstCard = page.locator('a[href^="/works/"]').first();
    await expect(firstCard).toBeVisible();
    const title = await firstCard.textContent();
    expect(title!.trim()[0].toUpperCase() < 'M').toBeTruthy();
  });

  test('casting note icon opens the casting flexibility modal', async ({
    page,
  }) => {
    const castingBtn = page.getByRole('button', {
      name: 'Note on Casting Flexibility',
    });
    await castingBtn.scrollIntoViewIfNeeded();
    await expect(castingBtn).toBeVisible();
    await castingBtn.click();
    // The casting modal doesn't use role="dialog" — find it by its heading text instead
    await expect(
      page.getByRole('heading', { name: /note on casting flexibility/i }),
    ).toBeVisible({ timeout: 3000 });
  });

  test('clicking a play card navigates to /works/[slug]', async ({
    page,
    isMobile,
  }) => {
    const firstCard = page.locator('a[href^="/works/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    const href = await firstCard.getAttribute('href');
    if (isMobile) {
      // Temporarily hide the sticky filter bar so it doesn't intercept the tap
      await page.evaluate(() => {
        const filterBar = document.querySelector(
          '[class*="filterBarOuter"]',
        ) as HTMLElement;
        if (filterBar) filterBar.style.display = 'none';
      });
      await firstCard.tap();
      // Restore the filter bar
      await page.evaluate(() => {
        const filterBar = document.querySelector(
          '[class*="filterBarOuter"]',
        ) as HTMLElement;
        if (filterBar) filterBar.style.display = '';
      });
    } else {
      await firstCard.click();
    }
    await expect(page).toHaveURL(href!, { timeout: 10000 });
  });

  test('/works page: filter bar is visible', async ({ page }) => {
    await expect(
      page.getByRole('searchbox', { name: /search plays/i }),
    ).toBeVisible();
  });
});
