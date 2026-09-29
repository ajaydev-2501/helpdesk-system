import { test, expect } from '../fixtures';

test.describe('Assessment Suite - Technical Assessment Specification (Tests 1 - 11)', () => {
  // Deterministic user generators for full test isolation
  const createMockUser = (suffix: string, role: 'USER' | 'ADMIN' = 'USER') => ({
    id: `usr-${suffix}-${Date.now()}`,
    name: role === 'ADMIN' ? `Admin ${suffix}` : `Customer ${suffix}`,
    email: `${role.toLowerCase()}.${suffix}.${Date.now()}@helpdesk.test`,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createMockTicket = (
    user: { id: string; name: string; email: string },
    overrides: Partial<{
      id: string;
      title: string;
      description: string;
      category: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    }> = {},
  ) => {
    const id = overrides.id || `tkt-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    return {
      id,
      title: overrides.title || `Issue report ${id}`,
      description: overrides.description || `Detailed description for reproduction of ticket ${id}.`,
      category: overrides.category || 'Technical Support',
      priority: overrides.priority || 'MEDIUM',
      status: overrides.status || 'OPEN',
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  };

  /**
   * Test 1: Registration → login
   */
  test('Test 1: Registration -> login', async ({ page }) => {
    const newUser = createMockUser('reg1', 'USER');

    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        }),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: newUser,
          accessToken: 'mock-jwt-reg-login',
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newUser),
      });
    });

    // 1. Visit registration page
    await page.goto('/register');
    await page.locator('[data-testid="register-name-input"]').fill(newUser.name);
    await page.locator('[data-testid="register-email-input"]').fill(newUser.email);
    await page.locator('[data-testid="register-password-input"]').fill('Password123!');
    await page.locator('[data-testid="register-confirm-password-input"]').fill('Password123!');
    await page.locator('[data-testid="register-submit-button"]').click();

    // After registration, redirected to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Perform fresh login test
    await page.goto('/login');
    await page.locator('[data-testid="login-email-input"]').fill(newUser.email);
    await page.locator('[data-testid="login-password-input"]').fill('Password123!');
    await page.locator('[data-testid="login-submit-button"]').click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText(`Welcome back, ${newUser.name}!`)).toBeVisible();
  });

  /**
   * Test 2: Login → create ticket → verify ticket
   */
  test('Test 2: Login -> create ticket -> verify ticket', async ({ page }) => {
    const user = createMockUser('create2', 'USER');
    const createdId = `tkt-created-${Date.now()}`;
    let createdTicketRecord: ReturnType<typeof createMockTicket> | null = null;

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user, accessToken: 'mock-jwt-test-2' }),
      });
    });

    await page.route('**/api/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        createdTicketRecord = createMockTicket(user, {
          id: createdId,
          title: body.title,
          description: body.description,
          category: body.category,
          priority: body.priority,
          status: 'OPEN',
        });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(createdTicketRecord),
        });
      }
    });

    await page.route(`**/api/tickets/${createdId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createdTicketRecord),
      });
    });

    // Login
    await page.goto('/login');
    await page.locator('[data-testid="login-email-input"]').fill(user.email);
    await page.locator('[data-testid="login-password-input"]').fill('Password123!');
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Navigate to Create Ticket
    await page.goto('/tickets/new');
    await expect(page.getByRole('heading', { name: 'Create Support Ticket' })).toBeVisible();

    // Fill form using stable data-testid selectors
    const testTitle = `Production SSL certificate expiration notice ${Date.now()}`;
    await page.locator('[data-testid="ticket-title-input"]').fill(testTitle);
    await page.locator('[data-testid="ticket-category-input"]').fill('Security');
    await page.locator('label').filter({ hasText: 'High' }).click();
    await page.locator('[data-testid="ticket-description-input"]').fill(
      'The wildcard SSL certificate expires in 48 hours and requires immediate renewal.',
    );
    await page.locator('[data-testid="ticket-submit-button"]').click();

    // Verify redirected and ticket details visible
    await expect(page).toHaveURL(new RegExp(`/tickets/${createdId}`));
    await expect(page.locator('[data-testid="ticket-detail-title"]')).toHaveText(testTitle);
    await expect(page.locator('[data-testid="ticket-detail-status"]')).toContainText('Open');
    await expect(page.getByText('Security')).toBeVisible();
  });

  /**
   * Test 3: View ticket → update status → verify
   */
  test('Test 3: View ticket -> update status -> verify', async ({ page }) => {
    const user = createMockUser('status3', 'USER');
    const ticket = createMockTicket(user, {
      title: 'Email notifications failing on batch dispatch',
      status: 'OPEN',
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
    });

    await page.route(`**/api/tickets/${ticket.id}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(ticket),
        });
      } else if (route.request().method() === 'PATCH') {
        const body = JSON.parse(route.request().postData() || '{}');
        ticket.status = body.status;
        ticket.updatedAt = new Date().toISOString();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(ticket),
        });
      }
    });

    await page.goto(`/tickets/${ticket.id}`);
    await expect(page.locator('[data-testid="ticket-detail-title"]')).toHaveText(ticket.title);
    await expect(page.locator('[data-testid="ticket-detail-status"]')).toContainText('Open');

    // Click In Progress status transition button
    await page.locator('[data-testid="ticket-status-in_progress"]').click();

    // Verify status updated in DOM
    await expect(page.locator('[data-testid="ticket-detail-status"]')).toContainText('In Progress');
  });

  /**
   * Test 4: Delete ticket → verify removed
   */
  test('Test 4: Delete ticket -> verify removed', async ({ page }) => {
    const user = createMockUser('del4', 'USER');
    let tickets = [
      createMockTicket(user, { title: 'Ticket to be deleted permanently' }),
      createMockTicket(user, { title: 'Surviving ticket after deletion' }),
    ];
    const targetTicket = tickets[0];

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
    });

    await page.route(`**/api/tickets/${targetTicket.id}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(targetTicket),
        });
      } else if (route.request().method() === 'DELETE') {
        tickets = tickets.filter((t) => t.id !== targetTicket.id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Ticket deleted successfully', id: targetTicket.id }),
        });
      }
    });

    await page.route('**/api/tickets?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: tickets,
          meta: {
            total: tickets.length,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });
    });

    await page.goto(`/tickets/${targetTicket.id}`);
    await expect(page.locator('[data-testid="ticket-detail-title"]')).toHaveText(targetTicket.title);

    // Click delete button and confirm
    await page.locator('[data-testid="ticket-delete-button"]').click();
    await expect(page.getByText('Confirm Ticket Deletion')).toBeVisible();
    await page.locator('[data-testid="ticket-confirm-delete-button"]').click();

    // Redirected to /tickets
    await expect(page).toHaveURL(/.*\/tickets/);
    // Deleted ticket must not be in the table
    await expect(page.locator('table').getByText(targetTicket.title)).not.toBeVisible();
    // Surviving ticket must remain
    await expect(page.locator('table').getByText('Surviving ticket after deletion')).toBeVisible();
  });

  /**
   * Test 5: Admin login → dashboard → statistics
   */
  test('Test 5: Admin login -> dashboard -> statistics', async ({ page }) => {
    const admin = createMockUser('adm5', 'ADMIN');

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(admin),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: admin, accessToken: 'mock-jwt-admin-5' }),
      });
    });

    await page.route('**/api/admin/tickets/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 42,
          open: 15,
          inProgress: 12,
          resolved: 15,
        }),
      });
    });

    await page.route('**/api/admin/tickets?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { total: 0, page: 1, limit: 5, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.goto('/login');
    await page.locator('[data-testid="login-email-input"]').fill(admin.email);
    await page.locator('[data-testid="login-password-input"]').fill('AdminPass123!');
    await page.locator('[data-testid="login-submit-button"]').click();

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByRole('heading', { name: /Administrative Control Center/i })).toBeVisible();

    // Verify 4 statistics cards with data-testid
    await expect(page.locator('[data-testid="stat-total-tickets"]')).toHaveText('42');
    await expect(page.locator('[data-testid="stat-open-tickets"]')).toHaveText('15');
    await expect(page.locator('[data-testid="stat-in-progress-tickets"]')).toHaveText('12');
    await expect(page.locator('[data-testid="stat-resolved-tickets"]')).toHaveText('15');
  });

  /**
   * Test 6: Admin search
   */
  test('Test 6: Admin search', async ({ page }) => {
    const admin = createMockUser('adm6', 'ADMIN');
    const u = createMockUser('cust6', 'USER');
    const allTickets = [
      createMockTicket(u, { title: 'PostgreSQL read replica replication lag' }),
      createMockTicket(u, { title: 'Monthly invoice payment receipt requested' }),
    ];

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(admin),
      });
    });

    await page.route('**/api/admin/tickets?**', async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');

      let filtered = [...allTickets];
      if (search) {
        filtered = filtered.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          meta: { total: filtered.length, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.goto('/admin/tickets');
    await expect(page.locator('[data-testid="admin-ticket-table"]')).toBeVisible();

    // Search by keyword "replication"
    await page.locator('[data-testid="admin-search-input"]').fill('replication');
    await page.locator('[data-testid="admin-search-button"]').click();

    // Matching ticket shown, non-matching omitted
    const table = page.locator('[data-testid="admin-ticket-table"]');
    await expect(table.getByText('PostgreSQL read replica replication lag')).toBeVisible();
    await expect(table.getByText('Monthly invoice payment receipt requested')).not.toBeVisible();
  });

  /**
   * Test 7: Admin status filter
   */
  test('Test 7: Admin status filter', async ({ page }) => {
    const admin = createMockUser('adm7', 'ADMIN');
    const u = createMockUser('cust7', 'USER');
    const allTickets = [
      createMockTicket(u, { title: 'Ticket currently open', status: 'OPEN' }),
      createMockTicket(u, { title: 'Ticket already resolved', status: 'RESOLVED' }),
    ];

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(admin),
      });
    });

    await page.route('**/api/admin/tickets?**', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');

      let filtered = [...allTickets];
      if (status) {
        filtered = filtered.filter((t) => t.status === status);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          meta: { total: filtered.length, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.goto('/admin/tickets');
    const table = page.locator('[data-testid="admin-ticket-table"]');

    // Filter by RESOLVED
    await page.locator('[data-testid="admin-status-filter"]').selectOption('RESOLVED');

    await expect(table.getByText('Ticket already resolved')).toBeVisible();
    await expect(table.getByText('Ticket currently open')).not.toBeVisible();
  });

  /**
   * Test 8: Admin priority filter
   */
  test('Test 8: Admin priority filter', async ({ page }) => {
    const admin = createMockUser('adm8', 'ADMIN');
    const u = createMockUser('cust8', 'USER');
    const allTickets = [
      createMockTicket(u, { title: 'High priority urgent security incident', priority: 'HIGH' }),
      createMockTicket(u, { title: 'Low priority typo in documentation', priority: 'LOW' }),
    ];

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(admin),
      });
    });

    await page.route('**/api/admin/tickets?**', async (route) => {
      const url = new URL(route.request().url());
      const priority = url.searchParams.get('priority');

      let filtered = [...allTickets];
      if (priority) {
        filtered = filtered.filter((t) => t.priority === priority);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          meta: { total: filtered.length, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.goto('/admin/tickets');
    const table = page.locator('[data-testid="admin-ticket-table"]');

    // Filter by HIGH
    await page.locator('[data-testid="admin-priority-filter"]').selectOption('HIGH');

    await expect(table.getByText('High priority urgent security incident')).toBeVisible();
    await expect(table.getByText('Low priority typo in documentation')).not.toBeVisible();
  });

  /**
   * Test 9: Admin updates ticket status
   */
  test('Test 9: Admin updates ticket status', async ({ page }) => {
    const admin = createMockUser('adm9', 'ADMIN');
    const u = createMockUser('cust9', 'USER');
    const targetTicket = createMockTicket(u, {
      title: 'Database replica synchronization failure',
      status: 'OPEN',
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(admin),
      });
    });

    await page.route('**/api/admin/tickets?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [targetTicket],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        }),
      });
    });

    await page.route(`**/api/admin/tickets/${targetTicket.id}/status`, async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      targetTicket.status = body.status;
      targetTicket.updatedAt = new Date().toISOString();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(targetTicket),
      });
    });

    await page.goto('/admin/tickets');
    const table = page.locator('[data-testid="admin-ticket-table"]');
    const row = table.locator('tr', { hasText: 'Database replica synchronization failure' });

    // Transition status to RESOLVED via actions select
    const statusSelect = row.getByRole('combobox', { name: /Update status for/i });
    await statusSelect.selectOption('RESOLVED');

    // Success feedback
    await expect(
      page.getByText(`Status for "${targetTicket.title}" updated to RESOLVED.`),
    ).toBeVisible();

    // Verify badge in column 4 changed to Resolved
    await expect(row.locator('td').nth(4).getByText('Resolved')).toBeVisible();
  });

  /**
   * Test 10: Normal user attempts admin route
   */
  test('Test 10: Normal user attempts admin route', async ({ page }) => {
    const normalUser = createMockUser('norm10', 'USER');

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(normalUser),
      });
    });

    // Attempt to access /admin directly
    await page.goto('/admin');
    await expect(page.locator('[data-testid="access-restricted-card"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Administrator Privileges Required' })).toBeVisible();
    await expect(page.getByText(normalUser.email)).toBeVisible();

    // Click Return to Dashboard
    await page.getByRole('link', { name: /Return to Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Attempt to access /admin/tickets directly
    await page.goto('/admin/tickets');
    await expect(page.locator('[data-testid="access-restricted-card"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Administrator Privileges Required' })).toBeVisible();
  });

  /**
   * Test 11: User attempts another user's ticket
   */
  test('Test 11: User attempts another users ticket', async ({ page }) => {
    const userA = createMockUser('alpha11', 'USER');
    const foreignTicketId = 'b0000000-0000-0000-0000-000000000002';

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userA),
      });
    });

    // Backend returns 403 Forbidden when accessing another user's ticket
    await page.route(`**/api/tickets/${foreignTicketId}`, async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 403,
          message: 'You do not have permission to access this ticket',
          error: 'Forbidden',
        }),
      });
    });

    // User A navigates directly to foreign ticket URL
    await page.goto(`/tickets/${foreignTicketId}`);

    // Verify error state is shown and user cannot view details
    await expect(page.getByRole('heading', { name: 'Unable to view ticket' })).toBeVisible();
    await expect(page.getByText('You do not have permission to access this ticket')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Tickets' })).toBeVisible();
  });
});
