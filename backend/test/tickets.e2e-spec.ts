import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Priority, Status, Role } from '@prisma/client';
import { hashPassword } from '../src/common/utils/password.util';

describe('Tickets REST API & Security (e2e)', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  const userAEmail = `user-a-${timestamp}@example.com`;
  const userBEmail = `user-b-${timestamp}@example.com`;
  const adminEmail = `admin-${timestamp}@example.com`;
  const defaultPassword = 'Password123!';

  let userAToken: string;
  let userBToken: string;
  let adminToken: string;

  let userAId: string;
  let userBId: string;
  let adminId: string;

  let createdTicketId: string;

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

    // Create User A, User B, and Admin directly in database
    const passwordHash = await hashPassword(defaultPassword);

    const userA = await prisma.user.create({
      data: {
        name: 'User Alpha',
        email: userAEmail,
        passwordHash,
        role: Role.USER,
      },
    });
    userAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        name: 'User Beta',
        email: userBEmail,
        passwordHash,
        role: Role.USER,
      },
    });
    userBId = userB.id;

    const admin = await prisma.user.create({
      data: {
        name: 'Admin Boss',
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    adminId = admin.id;

    // Login each to acquire JWT bearer tokens
    const loginUserA = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userAEmail, password: defaultPassword });
    userAToken = loginUserA.body.accessToken;

    const loginUserB = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userBEmail, password: defaultPassword });
    userBToken = loginUserB.body.accessToken;

    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: defaultPassword });
    adminToken = loginAdmin.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup users and cascading tickets
    const userIds = [userAId, userBId, adminId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Module Status Endpoint', () => {
    it('GET /api/tickets/status - returns 200 and module status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tickets/status')
        .expect(200);

      expect(response.body).toEqual({
        module: 'TicketsModule',
        status: 'active',
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /api/tickets - Create Ticket', () => {
    it('should return 401 Unauthorized when no authentication token is provided', async () => {
      await request(app.getHttpServer())
        .post('/api/tickets')
        .send({
          title: 'Unauthenticated Ticket',
          description: 'This request has no authorization header or cookie.',
          category: 'General',
        })
        .expect(401);
    });

    it('should return 400 Bad Request when required fields are missing or invalid', async () => {
      // Missing title
      await request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          description: 'Valid description that meets minimum length requirements.',
          category: 'Billing',
        })
        .expect(400);

      // Description too short
      await request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Valid Title',
          description: 'Short',
          category: 'Billing',
        })
        .expect(400);

      // Invalid priority enum
      await request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Valid Title',
          description: 'Valid description that meets minimum length requirements.',
          category: 'Billing',
          priority: 'SUPER_URGENT',
        })
        .expect(400);
    });

    it('should create ticket, default status to OPEN, and enforce userId from JWT', async () => {
      const payload = {
        title: 'Network latency in US-East cluster',
        description: 'Encountering packet loss and 800ms ping during peak traffic hours.',
        category: 'Infrastructure',
        priority: Priority.HIGH,
        userId: 'arbitrary-injected-user-id', // Should be ignored in favor of JWT identity
      };

      const response = await request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.description).toBe(payload.description);
      expect(response.body.category).toBe(payload.category);
      expect(response.body.priority).toBe(Priority.HIGH);
      expect(response.body.status).toBe(Status.OPEN); // Defaulted to OPEN
      expect(response.body.userId).toBe(userAId); // Inferred from JWT!
      expect(response.body.userId).not.toBe(payload.userId);

      createdTicketId = response.body.id;
    });

    it('should default priority to MEDIUM when not specified', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Second Ticket for User A',
          description: 'Another detailed issue description for pagination testing.',
          category: 'Account',
        })
        .expect(201);

      expect(response.body.priority).toBe(Priority.MEDIUM);
      expect(response.body.status).toBe(Status.OPEN);
      expect(response.body.userId).toBe(userAId);
    });
  });

  describe('GET /api/tickets - List My Tickets', () => {
    it('should return 401 Unauthorized when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/tickets').expect(401);
    });

    it('should only return tickets owned by the authenticated user', async () => {
      // User A has 2 tickets created above
      const resA = await request(app.getHttpServer())
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(resA.body).toHaveProperty('data');
      expect(resA.body).toHaveProperty('meta');
      expect(resA.body.meta.total).toBe(2);
      expect(resA.body.data).toHaveLength(2);
      resA.body.data.forEach((ticket: { userId: string }) => {
        expect(ticket.userId).toBe(userAId);
      });

      // User B has 0 tickets created
      const resB = await request(app.getHttpServer())
        .get('/api/tickets')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      expect(resB.body.meta.total).toBe(0);
      expect(resB.body.data).toHaveLength(0);
    });

    it('should support pagination (page, limit)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tickets?page=1&limit=1')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(1);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
      expect(response.body.meta.hasNextPage).toBe(true);
      expect(response.body.meta.hasPrevPage).toBe(false);
    });

    it('should support status and priority filtering', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tickets?status=${Status.OPEN}&priority=${Priority.HIGH}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].priority).toBe(Priority.HIGH);
      expect(response.body.data[0].status).toBe(Status.OPEN);
    });

    it('should support keyword search in title or description', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tickets?search=latency')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toContain('Network latency');
    });
  });

  describe('GET /api/tickets/:id - Get Ticket by ID', () => {
    it('should return 401 Unauthorized when unauthenticated', async () => {
      await request(app.getHttpServer())
        .get(`/api/tickets/${createdTicketId}`)
        .expect(401);
    });

    it('should return 400 Bad Request if ID is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/tickets/invalid-not-a-uuid')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(400);
    });

    it('should return 404 Not Found if ticket UUID does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/tickets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);
    });

    it('should allow USER to access their own ticket', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdTicketId);
      expect(response.body.userId).toBe(userAId);
    });

    it('should return 403 Forbidden when a regular user attempts to access another users ticket', async () => {
      // User B tries to view User A's ticket by simply changing the ID in the URL
      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(403);

      expect(response.body.message).toContain('You do not have permission');
    });

    it('should allow ADMIN to access any ticket', async () => {
      // Admin user views User A's ticket
      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdTicketId);
      expect(response.body.userId).toBe(userAId);
    });
  });

  describe('PATCH /api/tickets/:id - Update Ticket', () => {
    it('should return 401 Unauthorized when unauthenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}`)
        .send({ status: Status.IN_PROGRESS })
        .expect(401);
    });

    it('should return 400 Bad Request on invalid update data', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ priority: 'INVALID_ENUM' })
        .expect(400);
    });

    it('should return 403 Forbidden when User B tries to update User As ticket', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Malicious title modification' })
        .expect(403);
    });

    it('should allow User A to update their own ticket', async () => {
      const updateData = {
        title: 'Updated latency problem title',
        status: Status.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(Status.IN_PROGRESS);
    });

    it('should allow ADMIN to update any ticket', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.RESOLVED })
        .expect(200);

      expect(response.body.status).toBe(Status.RESOLVED);
    });
  });

  describe('DELETE /api/tickets/:id - Delete Ticket', () => {
    it('should return 401 Unauthorized when unauthenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tickets/${createdTicketId}`)
        .expect(401);
    });

    it('should return 403 Forbidden when User B tries to delete User As ticket', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(403);
    });

    it('should allow User A to delete their own ticket', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Ticket deleted successfully');
      expect(response.body).toHaveProperty('id', createdTicketId);

      // Verify it is gone from the database
      const check = await prisma.ticket.findUnique({
        where: { id: createdTicketId },
      });
      expect(check).toBeNull();
    });

    it('should return 404 Not Found when attempting to delete a non-existent ticket', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);
    });

    it('should allow ADMIN to delete any ticket', async () => {
      // Create a ticket for User B
      const ticketB = await prisma.ticket.create({
        data: {
          title: 'Ticket for User B',
          description: 'Ticket created to verify admin deletion capabilities.',
          category: 'General',
          userId: userBId,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/api/tickets/${ticketB.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Ticket deleted successfully');
      expect(response.body).toHaveProperty('id', ticketB.id);

      const check = await prisma.ticket.findUnique({
        where: { id: ticketB.id },
      });
      expect(check).toBeNull();
    });
  });
});
