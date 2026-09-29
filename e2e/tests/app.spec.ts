import { test, expect } from '../fixtures';

test.describe('Application Shell Smoke Tests', () => {
  test('should render homepage and verify header is omitted for unauthenticated visitors', async ({ page }) => {
    await page.goto('/');

    // Check title in document head
    await expect(page).toHaveTitle(/Mini Helpdesk & Support Ticket System/);

    // Header should not be visible when unauthenticated
    await expect(page.locator('header')).not.toBeVisible();

    // Check hero headline
    const heroTitle = page.getByRole('heading', {
      name: 'Mini Helpdesk & Support Ticket System',
      level: 1,
    });
    await expect(heroTitle).toBeVisible();

    // Check Get Started navigation exists
    await expect(page.getByRole('link', { name: /Get Started — Sign In/i })).toBeVisible();
  });

  test('should navigate from home to login and register cleanly without header', async ({ page }) => {
    await page.goto('/');

    // Click Get Started button to go to login
    await page.getByRole('link', { name: /Get Started — Sign In/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Sign In to Your Account/i })).toBeVisible();
    await expect(page.locator('header')).not.toBeVisible();

    // Click Create account link on login page
    await page.getByRole('link', { name: /Create account/i }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: /Create an account/i })).toBeVisible();
    await expect(page.locator('header')).not.toBeVisible();
  });
});


