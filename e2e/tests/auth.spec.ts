import { test, expect } from '../fixtures';

test.describe('Frontend Authentication & Route Protection', () => {
  const mockUser = {
    id: 'e2e-user-123',
    name: 'E2E Standard User',
    email: 'e2e-user@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAdmin = {
    id: 'e2e-admin-999',
    name: 'E2E System Admin',
    email: 'e2e-admin@example.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test.beforeEach(async ({ page }) => {
    // Default safe mocks for tickets and admin to prevent 401 leakage in auth tests
    await page.route('**/api/tickets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.route('**/api/admin/tickets/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 0, open: 0, inProgress: 0, resolved: 0 }),
      });
    });

    await page.route('**/api/admin/tickets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });
  });

  test('should validate registration form inputs and mismatching passwords', async ({ page }) => {
    await page.goto('/register');

    // Submit empty form
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Check validation errors appear
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    // Fill mismatching passwords
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('ValidPass123!');
    await page.locator('#confirmPassword').fill('DifferentPass456!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should toggle password visibility on login form', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('SecretPassword');

    // Initially type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await page.getByLabel('Show password').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again
    await page.getByLabel('Hide password').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should complete registration flow and redirect to dashboard', async ({ page }) => {
    // Intercept backend auth calls
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: mockUser,
          accessToken: 'mock-jwt-token-123',
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.goto('/register');

    await page.locator('#name').fill('E2E Standard User');
    await page.locator('#email').fill('e2e-user@example.com');
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('Password123!');

    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify redirected to /dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText('Welcome back, E2E Standard User!')).toBeVisible();
    await expect(page.locator('header').getByText('E2E Standard User')).toBeVisible();
  });

  test('should login successfully, maintain state on refresh, and access protected routes', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: mockUser,
          accessToken: 'mock-jwt-token-123',
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.goto('/login');

    await page.locator('#email').fill('e2e-user@example.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: /Welcome back, E2E Standard User!/i })).toBeVisible();

    // Refresh page - verify authentication persists
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText('Welcome back, E2E Standard User!')).toBeVisible();

    // Access protected route /tickets
    await page.locator('header').getByRole('link', { name: 'Tickets' }).click();
    await expect(page).toHaveURL(/.*\/tickets/);
    await expect(page.getByRole('heading', { name: 'Ticket Management' })).toBeVisible();
  });

  test('should redirect unauthenticated users away from protected routes to /login', async ({ page }) => {
    // Intercept /api/auth/me to return 401
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 401 });
    });

    // Try accessing /dashboard directly while unauthenticated
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);

    // Try accessing /tickets directly while unauthenticated
    await page.goto('/tickets');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should prevent normal USER from accessing /admin and display Access Restricted UI', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser), // Standard USER
      });
    });

    await page.goto('/admin');

    // Normal user should see Access Restricted screen
    await expect(page.getByText('Administrator Privileges Required')).toBeVisible();
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByRole('link', { name: /Return to Dashboard/i })).toBeVisible();
  });

  test('should allow ADMIN to access /admin UI', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAdmin), // ADMIN user
      });
    });

    await page.goto('/admin');

    await expect(page.getByText('Administrative Control Center')).toBeVisible();
    await expect(page.getByText('System-Wide Ticket Statistics')).toBeVisible();
  });

  test('should logout user and redirect to login page', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Successfully logged out' }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.getByText('Welcome back, E2E Standard User!')).toBeVisible();

    // Click logout button in header
    await page.locator('header').getByRole('button', { name: /Logout/i }).click();

    // Should redirect to /login
    await expect(page).toHaveURL(/.*\/login/);

    // After logout, visiting /dashboard redirects back to /login
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 401 });
    });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
