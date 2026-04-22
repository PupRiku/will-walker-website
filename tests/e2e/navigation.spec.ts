import { test, expect } from '@playwright/test';

test.describe('Navigation and routing', () => {
  test('clicking "Home" nav link navigates to /', async ({ page }) => {
    await page.goto('/cv');
    await page
      .getByRole('link', { name: /^home$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#home|\/$/);
  });

  test('clicking "About" nav link scrolls to #about section', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /^about$/i })
      .first()
      .click();
    await expect(page).toHaveURL('/#about');
  });

  test('clicking "Selected Works" nav link scrolls to #plays section', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /selected works/i })
      .first()
      .click();
    await expect(page).toHaveURL('/#plays');
  });

  test('clicking "Productions" nav link navigates to /productions', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /^productions$/i })
      .first()
      .click();
    await expect(page).toHaveURL('/productions');
  });

  test('clicking "CV" nav link navigates to /cv', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^cv$/i }).first().click();
    await expect(page).toHaveURL('/cv');
  });

  test('clicking "Contact Me" button scrolls to #contact section', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /contact me/i })
      .first()
      .click();
    await expect(page).toHaveURL('/#contact');
  });

  test('footer CV link navigates to /cv', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await footer.getByRole('link', { name: /^cv$/i }).click();
    await expect(page).toHaveURL('/cv');
  });

  test('logo click navigates to /#home', async ({ page }) => {
    await page.goto('/cv');
    await page
      .getByRole('link', { name: /william l\. walker montgomerie/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#home/);
  });
});
