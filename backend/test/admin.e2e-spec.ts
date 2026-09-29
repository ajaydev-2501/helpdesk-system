import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Priority, Status, Role } from '@prisma/client';
import { hashPassword } from '../src/common/utils/password.util';

describe('Admin Backend REST API & Authorization (e2e)', () => {
  jest.setTimeout(35000);

  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  const adminEmail = `admin-backend-${timestamp}@example.com`;
  const normalUserEmail = `normal-backend-${timestamp}@example.com`;
  const otherUserEmail = `other-backend-${timestamp}@example.com`;
  const defaultPassword = 'Password123!';

  let adminToken: string;
  let normalUserToken: string;

  let adminId: string;
  let normalUserId: string;
  let otherUserId: string;

  let ticketAId: string;
  let ticketBId: string;
  let ticketCId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test accounts
    const passwordHash = await hashPassword(defaultPassword);

    const admin = await prisma.user.create({
      data: {
        name: 'Chief Administrator',
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    adminId = admin.id;

    const normalUser = await prisma.user.create({
      data: {
        name: 'Normal Customer',
        email: normalUserEmail,
        passwordHash,
        role: Role.USER,
      },
    });
    normalUserId = normalUser.id;

    const otherUser = await prisma.user.create({
      data: {
        name: 'Other Customer',
        email: otherUserEmail,
        passwordHash,
        role: Role.USER,
      },
    });
    otherUserId = otherUser.id;

    // Login each to acquire JWT bearer tokens
    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: defaultPassword });
    adminToken = loginAdmin.body.accessToken;

    const loginNormal = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: normalUserEmail, password: defaultPassword });
    normalUserToken = loginNormal.body.accessToken;

    // Create tickets owned by different users
    const ticketA = await prisma.ticket.create({
      data: {
        title: 'Database connection latency in production',
        description: 'Connection pool exhausted on worker pods.',
        category: 'Database',
        priority: Priority.HIGH,
        status: Status.OPEN,
        userId: normalUserId,
      },
    });
    ticketAId = ticketA.id;

    const ticketB = await prisma.ticket.create({
      data: {
        title: 'Billing statement missing VAT registration',
        description: 'Recent invoice did not include the company tax number.',
        category: 'Billing',
        priority: Priority.MEDIUM,
        status: Status.IN_PROGRESS,
        userId: otherUserId,
      },
    });
    ticketBId = ticketB.id;

    const ticketC = await prisma.ticket.create({
      data: {
        title: 'Feature request for SSO SAML integration',
        description: 'Requesting Okta and Azure AD single sign-on support.',
        category: 'Features',
        priority: Priority.LOW,
        status: Status.RESOLVED,
        userId: normalUserId,
      },
    });
    ticketCId = ticketC.id;
  }, 35000);

  afterAll(async () => {
    const userIds = [adminId, normalUserId, otherUserId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    if (app) {
      await app.close();
    }
  }, 35000);

  describe('Authorization Enforcement (JwtAuthGuard & RolesGuard)', () => {
    it('GET /api/admin/tickets - 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/admin/tickets').expect(401);
    });

    it('GET /api/admin/tickets - 403 Forbidden when accessed by normal USER', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('GET /api/admin/tickets/stats - 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/admin/tickets/stats').expect(401);
    });

    it('GET /api/admin/tickets/stats - 403 Forbidden when accessed by normal USER', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets/stats')
        .set('Authorization', `Bearer ${normalUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('PATCH /api/admin/tickets/:id/status - 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/tickets/${ticketAId}/status`)
        .send({ status: Status.IN_PROGRESS })
        .expect(401);
    });

    it('PATCH /api/admin/tickets/:id/status - 403 Forbidden when accessed by normal USER', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/tickets/${ticketAId}/status`)
        .set('Authorization', `Bearer ${normalUserToken}`)
        .send({ status: Status.IN_PROGRESS })
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('GET /api/admin/tickets - Admin Ticket List', () => {
    it('should allow ADMIN to access all tickets across all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      // Verify tickets from different users are present
      const userIds = response.body.data.map((t: { userId: string }) => t.userId);
      expect(userIds).toContain(normalUserId);
      expect(userIds).toContain(otherUserId);
    });

    it('should return useful owner information and NEVER expose passwordHash', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const ticket = response.body.data.find((t: { id: string }) => t.id === ticketAId);
      expect(ticket).toBeDefined();
      expect(ticket.user).toBeDefined();
      expect(ticket.user.id).toBe(normalUserId);
      expect(ticket.user.name).toBe('Normal Customer');
      expect(ticket.user.email).toBe(normalUserEmail);

      // Verify passwordHash is never leaked
      expect(ticket.user.passwordHash).toBeUndefined();
      const stringified = JSON.stringify(response.body);
      expect(stringified).not.toContain('passwordHash');
    });

    it('should filter tickets by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/tickets?status=${Status.OPEN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((t: { status: string }) => {
        expect(t.status).toBe(Status.OPEN);
      });
    });

    it('should filter tickets by priority', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/tickets?priority=${Priority.HIGH}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((t: { priority: string }) => {
        expect(t.priority).toBe(Priority.HIGH);
      });
    });

    it('should search tickets by ticket title (case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets?search=database')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      const found = response.body.data.find((t: { id: string }) => t.id === ticketAId);
      expect(found).toBeDefined();
      expect(found.title).toContain('Database connection latency');
    });

    it('should support pagination (page, limit)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(3);
      expect(response.body.meta.totalPages).toBeGreaterThanOrEqual(2);
      expect(response.body.meta.hasNextPage).toBe(true);
    });
  });

  describe('GET /api/admin/tickets/stats - Statistics', () => {
    it('should return live database ticket statistics to ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/tickets/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('open');
      expect(response.body).toHaveProperty('inProgress');
      expect(response.body).toHaveProperty('resolved');

      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.open).toBe('number');
      expect(typeof response.body.inProgress).toBe('number');
      expect(typeof response.body.resolved).toBe('number');

      // Total must equal the sum of statuses
      expect(response.body.total).toBe(
        response.body.open + response.body.inProgress + response.body.resolved,
      );

      // At least 1 of each status was seeded in beforeAll
      expect(response.body.open).toBeGreaterThanOrEqual(1);
      expect(response.body.inProgress).toBeGreaterThanOrEqual(1);
      expect(response.body.resolved).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/admin/tickets/:id/status - Update Status', () => {
    it('should allow ADMIN to update ticket status to IN_PROGRESS', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/tickets/${ticketAId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.IN_PROGRESS })
        .expect(200);

      expect(response.body.id).toBe(ticketAId);
      expect(response.body.status).toBe(Status.IN_PROGRESS);

      // Verify in database
      const dbTicket = await prisma.ticket.findUnique({
        where: { id: ticketAId },
      });
      expect(dbTicket?.status).toBe(Status.IN_PROGRESS);
    });

    it('should allow ADMIN to update ticket status to RESOLVED', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/tickets/${ticketAId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.RESOLVED })
        .expect(200);

      expect(response.body.id).toBe(ticketAId);
      expect(response.body.status).toBe(Status.RESOLVED);
    });

    it('should return 400 Bad Request on invalid status enum', async () => {
      await request(app.getHttpServer())
        .patch(`/api/admin/tickets/${ticketAId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS_VALUE' })
        .expect(400);
    });

    it('should return 400 Bad Request on invalid UUID parameter', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/tickets/not-a-valid-uuid/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.OPEN })
        .expect(400);
    });

    it('should return 404 Not Found if ticket does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/tickets/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.OPEN })
        .expect(404);
    });
  });
});
