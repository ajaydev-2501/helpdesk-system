import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { SafeUser } from '@/users/dto';
import { AUTH_COOKIE_NAME } from './strategies/jwt.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockSafeUser: SafeUser = {
    id: 'user-ctrl-123',
    name: 'Controller User',
    email: 'ctrl@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('development'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register a new user and return SafeUser without passwordHash', async () => {
      const registerDto = {
        name: 'Controller User',
        email: 'ctrl@example.com',
        password: 'Password123!',
      };

      authService.register = jest.fn().mockResolvedValue(mockSafeUser);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockSafeUser);
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should authenticate user, set HTTP-only cookie, and return token and user', async () => {
      const loginDto = {
        email: 'ctrl@example.com',
        password: 'Password123!',
      };

      authService.login = jest.fn().mockResolvedValue({
        user: mockSafeUser,
        accessToken: 'signed.jwt.token',
        message: 'Authentication successful',
      });

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'signed.jwt.token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
      expect(result.user).toEqual(mockSafeUser);
      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });

  describe('getCurrentUser (GET /auth/me)', () => {
    it('should return the authenticated user profile and omit passwordHash', async () => {
      const result = await controller.getCurrentUser(mockSafeUser);

      expect(result).toEqual(mockSafeUser);
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should clear the authentication cookie and return success message', async () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
      expect(result.message).toBe('Successfully logged out');
    });
  });
});
