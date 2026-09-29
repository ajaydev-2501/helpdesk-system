import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '@/users/users.service';
import { Role } from '@prisma/client';
import { SafeUser } from '@/users/dto';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<Partial<UsersService>>;

  const mockSafeUser: SafeUser = {
    id: 'user-jwt-1',
    name: 'JWT Test User',
    email: 'jwt@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret-key'),
          },
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should validate and return SafeUser when user exists in database', async () => {
      usersService.findById = jest.fn().mockResolvedValue(mockSafeUser);

      const payload = {
        sub: mockSafeUser.id,
        email: mockSafeUser.email,
        role: mockSafeUser.role,
      };

      const result = await strategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith(mockSafeUser.id);
      expect(result).toEqual(mockSafeUser);
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException when user does not exist in database', async () => {
      usersService.findById = jest.fn().mockResolvedValue(null);

      const payload = {
        sub: 'deleted-user-id',
        email: 'deleted@example.com',
        role: Role.USER,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User account no longer exists or session is invalid',
      );
    });

    it('should throw UnauthorizedException when payload is malformed or missing sub', async () => {
      // @ts-expect-error Testing invalid runtime payload
      await expect(strategy.validate({})).rejects.toThrow(UnauthorizedException);
    });
  });
});
