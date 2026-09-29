import { test, expect } from '../fixtures';

test.describe('Complete User Ticket Flow (E2E)', () => {
  const mockUser = {
    id: 'user-flow-123',
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let mockTicket = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    title: 'VPN Connection Failure on Windows 11',
    description: 'Unable to connect to the internal VPN after the latest OS patch. Getting error code 800.',
    category: 'Technical Support',
    priority: 'HIGH',
    status: 'OPEN',
    userId: 'user-flow-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'user-flow-123',
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
    },
  };

  let ticketList = [mockTicket];

  test.beforeEach(async ({ page }) => {
    // Reset mock data
    mockTicket = {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'VPN Connection Failure on Windows 11',
      description: 'Unable to connect to the internal VPN after the latest OS patch. Getting error code 800.',
      category: 'Technical Support',
      priority: 'HIGH',
      status: 'OPEN',
      userId: 'user-flow-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user-flow-123',
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
      },
    };
    ticketList = [mockTicket];

    // Setup network routes
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
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
          accessToken: 'mock-jwt-token-flow',
        }),
      });
    });

    await page.route('**/api/tickets?**', async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');
      const status = url.searchParams.get('status');

      let filtered = [...ticketList];
      if (search) {
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase()),
        );
      }
      if (status) {
        filtered = filtered.filter((t) => t.status === status);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          meta: {
            total: filtered.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });
    });

    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        const newTicket = {
          id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
          title: body.title,
          description: body.description,
          category: body.category,
          priority: body.priority || 'MEDIUM',
          status: 'OPEN',
          userId: mockUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
          },
        };
        ticketList.push(newTicket);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newTicket),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: ticketList,
            meta: {
              total: ticketList.length,
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

    await page.route('**/api/tickets/*', async (route) => {
      const url = route.request().url();
      const id = url.split('/').pop()?.split('?')[0];

      if (route.request().method() === 'GET') {
        const found = ticketList.find((t) => t.id === id) || mockTicket;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(found),
        });
      } else if (route.request().method() === 'PATCH') {
        const body = JSON.parse(route.request().postData() || '{}');
        const foundIndex = ticketList.findIndex((t) => t.id === id);
        const current = foundIndex >= 0 ? ticketList[foundIndex] : mockTicket;
        const updated = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        if (foundIndex >= 0) ticketList[foundIndex] = updated;
        mockTicket = updated;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updated),
        });
      } else if (route.request().method() === 'DELETE') {
        ticketList = ticketList.filter((t) => t.id !== id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Ticket deleted successfully', id }),
        });
      }
    });
  });

  test('should complete full ticket journey: Login -> Dashboard -> Create -> List -> Details -> Update -> Delete', async ({
    page,
  }) => {
    // 1. Login
    await page.goto('/login');
    await page.locator('#email').fill('sarah.connor@example.com');
    await page.locator('#password').fill('Password123!');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Dashboard verification
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: /Welcome back, Sarah Connor!/i })).toBeVisible();
    await expect(page.getByText('Total Tickets')).toBeVisible();
    await expect(page.getByText('Open', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Resolved', { exact: true }).first()).toBeVisible();

    // 3. Navigate to Create Ticket from Dashboard
    await page.getByRole('link', { name: /Create Ticket/i }).first().click();
    await expect(page).toHaveURL(/.*\/tickets\/new/);
    await expect(page.getByRole('heading', { name: /Create Support Ticket/i })).toBeVisible();

    // Verify validation errors on empty submit
    await page.getByRole('button', { name: /Submit Ticket/i }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Category is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();

    // Fill valid form fields
    await page.locator('#title').fill('Database backup failure on primary instance');
    await page.locator('#category').fill('Infrastructure');
    // Select High priority
    await page.locator('label').filter({ hasText: 'High' }).click();
    await page.locator('#description').fill(
      'Nightly backup job failed with timeout error when dumping the user tablespace.',
    );

    // Submit form
    await page.getByRole('button', { name: /Submit Ticket/i }).click();

    // 4. Verify redirected to Ticket Details page
    await expect(page).toHaveURL(/.*\/tickets\/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/);
    await expect(
      page.getByRole('heading', { name: 'Database backup failure on primary instance' }),
    ).toBeVisible();
    await expect(page.getByText('Infrastructure')).toBeVisible();

    // 5. Navigate to Ticket List
    await page.getByRole('link', { name: /Back to All Tickets/i }).click();
    await expect(page).toHaveURL(/.*\/tickets/);
    await expect(page.getByRole('heading', { name: 'Ticket Management' })).toBeVisible();

    // Both tickets should be listed in the table
    await expect(page.locator('table').getByText('Database backup failure on primary instance')).toBeVisible();
    await expect(page.locator('table').getByText('VPN Connection Failure on Windows 11')).toBeVisible();

    // Test Search filter
    await page.locator('input[placeholder*="Search"]').fill('Database');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('table').getByText('Database backup failure on primary instance')).toBeVisible();

    // Click on ticket to view details again
    await page.locator('table').getByRole('link', { name: 'Database backup failure on primary instance' }).click();
    await expect(page).toHaveURL(/.*\/tickets\/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/);

    // 6. Update Status Workflow: Change to In Progress
    await page.getByRole('button', { name: 'In Progress' }).click();
    await expect(page.locator('main').getByText('In Progress').first()).toBeVisible();

    // Edit ticket title
    await page.getByRole('button', { name: /Edit Ticket/i }).click();
    await page.locator('#edit-title').fill('Database backup failure on primary instance (RESOLVED IN PATCH)');
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Database backup failure on primary instance (RESOLVED IN PATCH)',
      }),
    ).toBeVisible();

    // 7. Delete Ticket with confirmation
    await page.getByRole('button', { name: 'Delete' }).click();
    // Modal confirmation opens
    await expect(page.getByText('Confirm Ticket Deletion')).toBeVisible();
    await page.getByRole('button', { name: /Yes, Delete Ticket/i }).click();

    // Should redirect back to /tickets
    await expect(page).toHaveURL(/.*\/tickets/);
    // Deleted ticket should no longer exist
    await expect(
      page.locator('table').getByText('Database backup failure on primary instance (RESOLVED IN PATCH)'),
    ).not.toBeVisible();
  });
});

