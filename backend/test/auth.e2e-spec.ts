import { Test, TestingModule } from '@nestjs/testing';
import {
  Controller,
  Get,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { UsersRepository } from '@/users/users.repository';
import { Role, User } from '@prisma/client';
import { hashPassword } from '@/common/utils/password.util';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SafeUser } from '@/users/dto';

// Sample admin-only test controller to verify RolesGuard via HTTP
@Controller('test-roles')
class TestRolesController {
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminOnlyRoute(@CurrentUser() user: SafeUser) {
    return { status: 'admin-granted', user: user.email };
  }
}

describe('Authentication & Security E2E Tests', () => {
  let app: INestApplication;
  const inMemoryUsers: Map<string, User> = new Map();

  const mockUsersRepository = {
    findByEmail: jest.fn(async (email: string) => {
      const lower = email.trim().toLowerCase();
      for (const u of inMemoryUsers.values()) {
        if (u.email.toLowerCase() === lower) {
          return u;
        }
      }
      return null;
    }),

    findById: jest.fn(async (id: string) => {
      return inMemoryUsers.get(id) || null;
    }),

    create: jest.fn(async (data: { name: string; email: string; passwordHash: string; role?: Role }) => {
      const id = `user-id-${Date.now()}-${Math.random()}`;
      const newUser: User = {
        id,
        name: data.name,
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role || Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.set(id, newUser);
      return newUser;
    }),

    findAll: jest.fn(async () => Array.from(inMemoryUsers.values())),
  };

  beforeAll(async () => {
    // Pre-populate an existing user for testing login and duplicate email
    const preHashedPassword = await hashPassword('ExistingPass123!');
    const existingUser: User = {
      id: 'existing-user-uuid',
      name: 'Existing John',
      email: 'existing@example.com',
      passwordHash: preHashedPassword,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryUsers.set(existingUser.id, existingUser);

    // Pre-populate an admin user for testing RolesGuard
    const adminHashedPassword = await hashPassword('AdminPass123!');
    const adminUser: User = {
      id: 'admin-user-uuid',
      name: 'Admin Boss',
      email: 'admin@example.com',
      passwordHash: adminHashedPassword,
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryUsers.set(adminUser.id, adminUser);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestRolesController],
    })
      .overrideProvider(UsersRepository)
      .useValue(mockUsersRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully (201 Created)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Jane Developer',
          email: 'jane@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.email).toBe('jane@example.com');
      expect(response.body.name).toBe('Jane Developer');
      expect(response.body.role).toBe('USER');
      // Critical check: passwordHash is NEVER returned
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should reject registration when email is already registered (409 Conflict)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Another John',
          email: 'existing@example.com',
          password: 'Password123!',
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should reject registration with invalid email format (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Valid Name',
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('should reject registration with password shorter than 8 characters (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Valid Name',
          email: 'test-short@example.com',
          password: '123',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('8 characters')]),
      );
    });

    it('should reject registration with non-whitelisted properties (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Valid Name',
          email: 'whitelisted@example.com',
          password: 'Password123!',
          hackerField: 'malicious',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid credentials, set HTTP-only cookie, and return token (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'ExistingPass123!',
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('existing@example.com');
      // Critical check: passwordHash is NEVER returned in login response
      expect(response.body.user.passwordHash).toBeUndefined();

      // Check HTTP-only cookie header
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/access_token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'WrongPassword999!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should reject login with nonexistent email (401 Unauthorized)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'ghost@example.com',
          password: 'AnyPassword123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
      // Login as user to get token
      const userRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'existing@example.com',
          password: 'ExistingPass123!',
        });
      userToken = userRes.body.accessToken;

      // Login as admin to get token
      const adminRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123!',
        });
      adminToken = adminRes.body.accessToken;
    });

    it('should return authenticated user profile via Authorization Bearer header (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.email).toBe('existing@example.com');
      expect(response.body.name).toBe('Existing John');
      expect(response.body.role).toBe('USER');
      // Password hash must never be returned
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return authenticated user profile via HTTP-only cookie (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', [`access_token=${userToken}`])
        .expect(200);

      expect(response.body.email).toBe('existing@example.com');
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should reject unauthenticated request to /auth/me (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should reject request with forged or invalid token (401 Unauthorized)', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer forged.invalid.token')
        .expect(401);
    });

    it('should enforce RolesGuard and permit Role.ADMIN access to admin route', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/test-roles/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('admin-granted');
      expect(response.body.user).toBe('admin@example.com');
    });

    it('should enforce RolesGuard and reject Role.USER access with 403 Forbidden', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/test-roles/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toContain('Insufficient permissions');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the access_token cookie and return success message (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Successfully logged out');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Cookie is cleared by setting expiration in the past
      expect(cookies[0]).toMatch(/access_token=;/);
    });
  });
});
