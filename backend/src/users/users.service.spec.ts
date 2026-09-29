import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Role, User } from '@prisma/client';
import { verifyPassword } from '@/common/utils/password.util';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<Partial<UsersRepository>>;

  const dummyUser: User = {
    id: 'user-uuid-1234',
    name: 'Alice Support',
    email: 'alice@example.com',
    passwordHash: '$2b$10$hashedPasswordHere123456789012345678901234567890',
    role: Role.USER,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    const createUserDto = {
      name: 'Alice Support',
      email: 'Alice@Example.COM ', // Tests trimming & lowercasing normalization
      password: 'PlaintextPassword123!',
      role: Role.USER,
    };

    it('should create a user, hash the password, and return a SafeUser without passwordHash', async () => {
      mockRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockRepository.create = jest.fn().mockImplementation(async (data) => {
        return {
          id: 'generated-uuid-5678',
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      const result = await service.createUser(createUserDto);

      // Verify email was normalized
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('alice@example.com');

      // Verify password was hashed (never stored plaintext)
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      const passedCreateData = (mockRepository.create as jest.Mock).mock.calls[0][0];
      expect(passedCreateData.passwordHash).not.toEqual(createUserDto.password);
      expect(passedCreateData.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);

      // Verify password verification succeeds against the generated hash
      const isMatch = await verifyPassword(createUserDto.password, passedCreateData.passwordHash);
      expect(isMatch).toBe(true);

      // Verify the returned user is a SafeUser WITHOUT passwordHash
      expect(result).toBeDefined();
      expect(result.id).toBe('generated-uuid-5678');
      expect(result.email).toBe('alice@example.com');
      expect(result.name).toBe('Alice Support');
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should prevent duplicate registration by throwing ConflictException when email exists', async () => {
      mockRepository.findByEmail = jest.fn().mockResolvedValue(dummyUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'A user with this email address already exists',
      );

      // Should not call create if email exists
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a SafeUser when user is found and omit passwordHash', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(dummyUser);

      const result = await service.findById(dummyUser.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(dummyUser.id);
      expect(result?.email).toBe(dummyUser.email);
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrThrow', () => {
    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.findByIdOrThrow('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should normalize email query and return SafeUser without passwordHash', async () => {
      mockRepository.findByEmail = jest.fn().mockResolvedValue(dummyUser);

      const result = await service.findByEmail(' ALICE@example.COM ');

      expect(mockRepository.findByEmail).toHaveBeenCalledWith('alice@example.com');
      expect(result).toBeDefined();
      expect(result?.email).toBe(dummyUser.email);
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null if user does not exist', async () => {
      mockRepository.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findUserWithPasswordByEmail', () => {
    it('should return the complete User with passwordHash for internal authentication use', async () => {
      mockRepository.findByEmail = jest.fn().mockResolvedValue(dummyUser);

      const result = await service.findUserWithPasswordByEmail('alice@example.com');

      expect(result).toBeDefined();
      expect(result?.passwordHash).toBe(dummyUser.passwordHash);
    });
  });
});
