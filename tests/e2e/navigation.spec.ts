import { test, expect } from '@playwright/test';

test.describe('Navigation and routing', () => {
  // Helper to click a nav link — opens mobile menu first if on mobile
  async function clickNavLink(
    page: any,
    isMobile: boolean,
    name: RegExp,
    nth: 'first' | 'last' = 'first',
  ) {
    if (isMobile) {
      await page.getByRole('button', { name: /open navigation menu/i }).tap();
      await expect(
        page.getByRole('link', { name: /^home$/i }).last(),
      ).toBeVisible({ timeout: 3000 });
      await page.getByRole('link', { name }).last().tap();
    } else {
      await page.getByRole('link', { name }).first().click();
    }
  }

  test('clicking "Home" nav link navigates to /', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/cv');
    await clickNavLink(page, isMobile, /^home$/i);
    await expect(page).toHaveURL(/\/#home|\/$|\/$/);
  });

  test('clicking "About" nav link scrolls to #about section', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await clickNavLink(page, isMobile, /^about$/i);
    await expect(page).toHaveURL('/#about');
  });

  test('clicking "Selected Works" nav link scrolls to #plays section', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await clickNavLink(page, isMobile, /selected works/i);
    await expect(page).toHaveURL('/#plays');
  });

  test('clicking "Productions" nav link navigates to /productions', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await clickNavLink(page, isMobile, /^productions$/i);
    await expect(page).toHaveURL('/productions');
  });

  test('clicking "CV" nav link navigates to /cv', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await clickNavLink(page, isMobile, /^cv$/i);
    await expect(page).toHaveURL('/cv', { timeout: 10000 });
  });

  test('clicking "Contact Me" button scrolls to #contact section', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    if (isMobile) {
      await page.getByRole('button', { name: /open navigation menu/i }).tap();
      await expect(
        page.getByRole('link', { name: /contact me/i }).last(),
      ).toBeVisible({ timeout: 3000 });
      await page
        .getByRole('link', { name: /contact me/i })
        .last()
        .tap();
    } else {
      // Desktop Contact Me is a styled link/button in the header actions
      await page
        .getByRole('link', { name: /contact me/i })
        .first()
        .click();
    }
    await expect(page).toHaveURL('/#contact');
  });

  test('footer CV link navigates to /cv', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
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
