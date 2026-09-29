import { test, expect } from '../fixtures';

test.describe('Complete Admin Dashboard & Ticket Management (E2E)', () => {
  const normalUser = {
    id: 'user-regular-001',
    name: 'Normal Customer',
    email: 'customer@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adminUser = {
    id: 'user-admin-999',
    name: 'Ops Administrator',
    email: 'admin@helpdesk.internal',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let mockTickets = [
    {
      id: 't-101-alpha',
      title: 'Database connection latency spike in EU region',
      description: 'Latency exceeded 500ms on primary read replica.',
      category: 'Infrastructure',
      priority: 'HIGH',
      status: 'OPEN',
      userId: 'user-regular-001',
      createdAt: '2026-09-28T10:00:00.000Z',
      updatedAt: '2026-09-28T10:00:00.000Z',
      user: {
        id: 'user-regular-001',
        name: 'Alice Johnson',
        email: 'alice@enterprise.corp',
      },
    },
    {
      id: 't-102-beta',
      title: 'Billing invoice invoice discrepancy for October',
      description: 'Customer charged twice for enterprise seats tier.',
      category: 'Billing',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      userId: 'user-regular-002',
      createdAt: '2026-09-28T11:30:00.000Z',
      updatedAt: '2026-09-28T12:00:00.000Z',
      user: {
        id: 'user-regular-002',
        name: 'Bob Martinez',
        email: 'bob@startup.io',
      },
    },
    {
      id: 't-103-gamma',
      title: 'Password reset link token expiration too short',
      description: 'Reset email token expires after only 5 minutes.',
      category: 'Security',
      priority: 'LOW',
      status: 'RESOLVED',
      userId: 'user-regular-003',
      createdAt: '2026-09-27T09:15:00.000Z',
      updatedAt: '2026-09-28T14:45:00.000Z',
      user: {
        id: 'user-regular-003',
        name: 'Carol Danvers',
        email: 'carol@shield.gov',
      },
    },
  ];

  test.describe('Role Protection Verification', () => {
    test('normal USER cannot access /admin or /admin/tickets and sees Access Restricted screen', async ({
      page,
    }) => {
      // Mock /api/auth/me as normal USER
      await page.route('**/api/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(normalUser),
        });
      });

      // Try navigating directly to /admin
      await page.goto('/admin');

      // Verify Access Restricted UI is displayed
      await expect(page.getByText('Access Restricted')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Administrator Privileges Required' })).toBeVisible();
      await expect(page.getByText('customer@example.com')).toBeVisible();
      await expect(page.getByRole('paragraph').getByText('USER')).toBeVisible();

      // Click "Return to Dashboard"
      await page.getByRole('link', { name: /Return to Dashboard/i }).click();
      await expect(page).toHaveURL(/.*\/dashboard/);

      // Try navigating directly to /admin/tickets
      await page.goto('/admin/tickets');
      await expect(page.getByText('Access Restricted')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Administrator Privileges Required' })).toBeVisible();
    });
  });

  test.describe('Admin Dashboard and Ticket Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Reset mock tickets array for fresh state
      mockTickets = [
        {
          id: 't-101-alpha',
          title: 'Database connection latency spike in EU region',
          description: 'Latency exceeded 500ms on primary read replica.',
          category: 'Infrastructure',
          priority: 'HIGH',
          status: 'OPEN',
          userId: 'user-regular-001',
          createdAt: '2026-09-28T10:00:00.000Z',
          updatedAt: '2026-09-28T10:00:00.000Z',
          user: {
            id: 'user-regular-001',
            name: 'Alice Johnson',
            email: 'alice@enterprise.corp',
          },
        },
        {
          id: 't-102-beta',
          title: 'Billing invoice discrepancy for October',
          description: 'Customer charged twice for enterprise seats tier.',
          category: 'Billing',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          userId: 'user-regular-002',
          createdAt: '2026-09-28T11:30:00.000Z',
          updatedAt: '2026-09-28T12:00:00.000Z',
          user: {
            id: 'user-regular-002',
            name: 'Bob Martinez',
            email: 'bob@startup.io',
          },
        },
        {
          id: 't-103-gamma',
          title: 'Password reset link token expiration too short',
          description: 'Reset email token expires after only 5 minutes.',
          category: 'Security',
          priority: 'LOW',
          status: 'RESOLVED',
          userId: 'user-regular-003',
          createdAt: '2026-09-27T09:15:00.000Z',
          updatedAt: '2026-09-28T14:45:00.000Z',
          user: {
            id: 'user-regular-003',
            name: 'Carol Danvers',
            email: 'carol@shield.gov',
          },
        },
      ];

      // Auth mocks
      await page.route('**/api/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(adminUser),
        });
      });

      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: adminUser,
            accessToken: 'mock-admin-token-12345',
          }),
        });
      });

      // Admin Stats Endpoint
      await page.route('**/api/admin/tickets/stats', async (route) => {
        const total = mockTickets.length;
        const open = mockTickets.filter((t) => t.status === 'OPEN').length;
        const inProgress = mockTickets.filter((t) => t.status === 'IN_PROGRESS').length;
        const resolved = mockTickets.filter((t) => t.status === 'RESOLVED').length;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            total,
            open,
            inProgress,
            resolved,
          }),
        });
      });

      // Admin Tickets List Endpoint with backend search, status, and priority query filters
      await page.route('**/api/admin/tickets?**', async (route) => {
        const url = new URL(route.request().url());
        const search = url.searchParams.get('search');
        const status = url.searchParams.get('status');
        const priority = url.searchParams.get('priority');
        const pageNum = parseInt(url.searchParams.get('page') || '1', 10);
        const limitNum = parseInt(url.searchParams.get('limit') || '10', 10);

        let filtered = [...mockTickets];

        if (search) {
          filtered = filtered.filter((t) =>
            t.title.toLowerCase().includes(search.toLowerCase()),
          );
        }

        if (status) {
          filtered = filtered.filter((t) => t.status === status);
        }

        if (priority) {
          filtered = filtered.filter((t) => t.priority === priority);
        }

        const startIndex = (pageNum - 1) * limitNum;
        const paged = filtered.slice(startIndex, startIndex + limitNum);
        const totalPages = Math.ceil(filtered.length / limitNum) || 1;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: paged,
            meta: {
              total: filtered.length,
              page: pageNum,
              limit: limitNum,
              totalPages,
              hasNextPage: pageNum < totalPages,
              hasPrevPage: pageNum > 1,
            },
          }),
        });
      });

      // Admin Tickets Default (non-querystring) List
      await page.route('**/api/admin/tickets', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: mockTickets,
              meta: {
                total: mockTickets.length,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }),
          });
        }
      });

      // Admin Status Update Endpoint
      await page.route('**/api/admin/tickets/*/status', async (route) => {
        if (route.request().method() === 'PATCH') {
          const url = route.request().url();
          // Extract ticket ID from url e.g. /api/admin/tickets/t-101-alpha/status
          const parts = url.split('/');
          const id = parts[parts.indexOf('tickets') + 1];
          const body = JSON.parse(route.request().postData() || '{}');

          const ticketIndex = mockTickets.findIndex((t) => t.id === id);
          if (ticketIndex >= 0) {
            mockTickets[ticketIndex] = {
              ...mockTickets[ticketIndex],
              status: body.status,
              updatedAt: new Date().toISOString(),
            };
          }

          // Delay slightly to test loading feedback
          await new Promise((r) => setTimeout(r, 200));

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockTickets[ticketIndex]),
          });
        }
      });
    });

    test('full admin flow: Login -> Dashboard Stats -> Ticket Table -> Search -> Filters -> Status Update', async ({
      page,
    }) => {
      // 1. Admin Login
      await page.goto('/login');
      await page.locator('#email').fill('admin@helpdesk.internal');
      await page.locator('#password').fill('AdminPassword123!');
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Check header shows ADMIN badge and Admin navigation item
      await expect(page.locator('header').getByText('ADMIN').first()).toBeVisible();
      await expect(page.locator('header').getByRole('link', { name: /Admin/i })).toBeVisible();

      // 2. Navigate to /admin (Admin Dashboard)
      await page.goto('/admin');
      await expect(page).toHaveURL(/.*\/admin/);

      // Verify Administrative Control Center banner
      await expect(
        page.getByRole('heading', { name: /Administrative Control Center/i }),
      ).toBeVisible();
      await expect(page.getByText('admin@helpdesk.internal')).toBeVisible();

      // Verify 4 Statistics Cards fetched from GET /api/admin/tickets/stats
      await expect(page.getByText('Total Tickets')).toBeVisible();
      await expect(page.getByText('3', { exact: true })).toBeVisible(); // 3 total tickets
      await expect(page.getByText('Open', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
      await expect(page.getByText('Resolved', { exact: true }).first()).toBeVisible();

      // Verify Recent Customer Tickets list on dashboard
      await expect(
        page.getByText('Database connection latency spike in EU region').first(),
      ).toBeVisible();
      await expect(page.getByText('Alice Johnson (alice@enterprise.corp)').first()).toBeVisible();

      // 3. Navigate to Ticket Management Queue (/admin/tickets)
      await page.getByRole('link', { name: /Manage All Tickets/i }).first().click();
      await expect(page).toHaveURL(/.*\/admin\/tickets/);
      await expect(page.getByRole('heading', { name: /Ticket Management Queue/i })).toBeVisible();

      // 4. Verify Professional Table Columns
      const table = page.locator('table');
      await expect(table.getByRole('columnheader', { name: 'Ticket' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Category' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Priority' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Created' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Updated' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

      // Verify customer information rendered in table (name + email without passwordHash)
      await expect(table.getByText('Alice Johnson')).toBeVisible();
      await expect(table.getByText('alice@enterprise.corp')).toBeVisible();
      await expect(table.getByText('Bob Martinez')).toBeVisible();
      await expect(table.getByText('bob@startup.io')).toBeVisible();

      // 5. Backend Search: search for "latency"
      const searchInput = page.locator('input[placeholder*="Search by ticket title"]');
      await searchInput.fill('latency');
      await page.getByRole('button', { name: 'Search' }).click();

      // Should only show the latency ticket
      await expect(table.getByText('Database connection latency spike in EU region')).toBeVisible();
      await expect(table.getByText('Billing invoice discrepancy for October')).not.toBeVisible();
      await expect(table.getByText('Password reset link token expiration too short')).not.toBeVisible();

      // Clear search
      await page.getByRole('button', { name: 'Clear' }).click();
      await expect(table.getByText('Billing invoice discrepancy for October')).toBeVisible();

      // 6. Backend Status Filter: filter by "RESOLVED"
      const statusSelect = page.locator('select').first();
      await statusSelect.selectOption('RESOLVED');

      // Only the resolved ticket should be present
      await expect(table.getByText('Password reset link token expiration too short')).toBeVisible();
      await expect(table.getByText('Database connection latency spike in EU region')).not.toBeVisible();

      // Clear filters
      await page.getByRole('button', { name: 'Clear' }).click();
      await expect(table.getByText('Database connection latency spike in EU region')).toBeVisible();

      // 7. Backend Priority Filter: filter by "HIGH"
      const prioritySelect = page.locator('select').nth(1);
      await prioritySelect.selectOption('HIGH');

      await expect(table.getByText('Database connection latency spike in EU region')).toBeVisible();
      await expect(table.getByText('Billing invoice discrepancy for October')).not.toBeVisible();

      // Reset to All Priorities
      await prioritySelect.selectOption('');
      await expect(table.getByText('Billing invoice discrepancy for October')).toBeVisible();

      // 8. Update Ticket Status: Change "Database connection latency spike" from OPEN to RESOLVED
      const row = table.locator('tr', { hasText: 'Database connection latency spike' });
      const actionSelect = row.getByRole('combobox', { name: /Update status for/i });

      await actionSelect.selectOption('RESOLVED');

      // Verify success feedback alert is displayed
      await expect(
        page.getByText('Status for "Database connection latency spike in EU region" updated to RESOLVED.'),
      ).toBeVisible();

      // Verify badge changed to Resolved (column index 4 is Status)
      await expect(row.locator('td').nth(4).getByText('Resolved')).toBeVisible();
    });

    test('admin tickets responsive layout renders properly on mobile viewport', async ({ page }) => {
      // Set viewport to mobile size (iPhone 12 / standard mobile)
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/admin/tickets');
      await expect(page.getByRole('heading', { name: /Ticket Management Queue/i })).toBeVisible();

      // Desktop table should be hidden on small screens
      await expect(page.locator('table')).not.toBeVisible();

      // Mobile cards should be visible in the mobile container
      const mobileContainer = page.locator('.lg\\:hidden');
      await expect(
        mobileContainer.getByText('Database connection latency spike in EU region'),
      ).toBeVisible();
      await expect(mobileContainer.getByText('Alice Johnson')).toBeVisible();
      await expect(mobileContainer.getByText('alice@enterprise.corp')).toBeVisible();

      // Mobile status updater should work
      const mobileStatusSelect = mobileContainer
        .getByRole('combobox', { name: /Update status for Database connection latency spike/i });
      await mobileStatusSelect.selectOption('IN_PROGRESS');

      await expect(
        page.getByText('Status for "Database connection latency spike in EU region" updated to IN_PROGRESS.'),
      ).toBeVisible();
    });
  });
});
