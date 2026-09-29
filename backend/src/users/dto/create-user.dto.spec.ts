import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { Role } from '@prisma/client';

describe('CreateUserDto Validation', () => {
  const validData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    role: Role.USER,
  };

  it('should validate a complete, valid DTO successfully', async () => {
    const dto = plainToInstance(CreateUserDto, validData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  describe('name validation', () => {
    it('should fail if name is empty or missing', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validData, name: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name is shorter than 2 characters', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validData, name: 'J' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        name: 'A'.repeat(101),
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should fail if email is not a valid email format', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        email: 'invalid-email-string',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail if email is empty', async () => {
      const dto = plainToInstance(CreateUserDto, { ...validData, email: '' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should normalize, trim, and lowercase email during transformation', () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        email: '  JOHN.DOE@EXAMPLE.COM ',
      });

      expect(dto.email).toBe('john.doe@example.com');
    });

    it('should fail if email exceeds 255 characters', async () => {
      const longEmail = `${'a'.repeat(250)}@test.com`;
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        email: longEmail,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should fail if password is shorter than 8 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        password: 'short',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints?.minLength).toContain('at least 8 characters');
    });

    it('should fail if password is empty or missing', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        password: '',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail if password exceeds 128 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        password: 'P'.repeat(129),
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should succeed with exactly 8 characters', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        password: '12345678',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('role validation', () => {
    it('should accept Role.ADMIN', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        role: Role.ADMIN,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail with an invalid role', async () => {
      const dto = plainToInstance(CreateUserDto, {
        ...validData,
        role: 'SUPERADMIN',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'role')).toBe(true);
    });
  });
});
