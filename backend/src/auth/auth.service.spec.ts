import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { Role, User } from '@prisma/client';
import { hashPassword } from '@/common/utils/password.util';
import { SafeUser } from '@/users/dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  let hashedPassword: string;
  let testUserWithPassword: User;

  beforeAll(async () => {
    hashedPassword = await hashPassword('CorrectPassword123!');
    testUserWithPassword = {
      id: 'user-auth-uuid-1',
      name: 'Bob Agent',
      email: 'bob@example.com',
      passwordHash: hashedPassword,
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
  });

  beforeEach(async () => {
    usersService = {
      findUserWithPasswordByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should validate user with correct password and return SafeUser without passwordHash', async () => {
      usersService.findUserWithPasswordByEmail = jest
        .fn()
        .mockResolvedValue(testUserWithPassword);

      const result = await authService.validateUser(
        'bob@example.com',
        'CorrectPassword123!',
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(testUserWithPassword.id);
      expect(result?.email).toBe(testUserWithPassword.email);
      expect(result?.name).toBe(testUserWithPassword.name);
      // Ensure passwordHash is NOT returned
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null when password is incorrect', async () => {
      usersService.findUserWithPasswordByEmail = jest
        .fn()
        .mockResolvedValue(testUserWithPassword);

      const result = await authService.validateUser(
        'bob@example.com',
        'WrongPassword999!',
      );

      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      usersService.findUserWithPasswordByEmail = jest
        .fn()
        .mockResolvedValue(null);

      const result = await authService.validateUser(
        'nonexistent@example.com',
        'SomePassword123!',
      );

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token containing sub, email, and role', async () => {
      const safeUser: SafeUser = {
        id: 'user-auth-uuid-1',
        name: 'Bob Agent',
        email: 'bob@example.com',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await authService.generateToken(safeUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });
      expect(result).toBe('mocked.jwt.token');
    });
  });

  describe('register', () => {
    it('should register a new user with role USER and return SafeUser', async () => {
      const registerDto = {
        name: 'Charlie User',
        email: 'charlie@example.com',
        password: 'Password123!',
      };

      usersService.createUser = jest.fn().mockResolvedValue({
        id: 'user-charlie-id',
        name: registerDto.name,
        email: registerDto.email,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(usersService.createUser).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
        role: Role.USER,
      });
      expect(result.id).toBe('user-charlie-id');
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login valid credentials and return user and token', async () => {
      usersService.findUserWithPasswordByEmail = jest
        .fn()
        .mockResolvedValue(testUserWithPassword);

      const result = await authService.login({
        email: 'bob@example.com',
        password: 'CorrectPassword123!',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('bob@example.com');
      expect((result.user as Record<string, unknown>).passwordHash).toBeUndefined();
      expect(result.accessToken).toBe('mocked.jwt.token');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      usersService.findUserWithPasswordByEmail = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'bad@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
