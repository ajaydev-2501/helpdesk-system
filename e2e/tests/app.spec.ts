import { test, expect } from '../fixtures';

test.describe('Application Shell Smoke Tests', () => {
  test('should render homepage header, brand, and auth navigation', async ({ page }) => {
    await page.goto('/');

    // Check title in document head
    await expect(page).toHaveTitle(/Mini Helpdesk & Support Ticket System/);

    // Check brand in header
    const brand = page.locator('header').getByText('Mini Helpdesk');
    await expect(brand).toBeVisible();

    // Check hero headline
    const heroTitle = page.getByRole('heading', {
      name: 'Mini Helpdesk & Support Ticket System',
      level: 1,
    });
    await expect(heroTitle).toBeVisible();

    // Check auth navigation items exist for visitors
    await expect(page.locator('header').getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: /Register/i })).toBeVisible();
  });

  test('should navigate from home to login and register cleanly', async ({ page }) => {
    await page.goto('/');

    // Click Sign In navigation
    await page.locator('header').getByRole('link', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Sign In to Your Account/i })).toBeVisible();

    // Click Register navigation
    await page.locator('header').getByRole('link', { name: /Register/i }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: /Create an account/i })).toBeVisible();
  });
});


