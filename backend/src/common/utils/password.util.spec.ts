import { hashPassword, verifyPassword } from './password.util';

describe('Password Security Utilities (password.util)', () => {
  const plainPassword = 'SecurePassword123!';

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toEqual(plainPassword);
      // Bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should generate different salts/hashes for the same password', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toEqual(hash2);
    });

    it('should reject empty or non-string inputs', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
      // @ts-expect-error Testing invalid runtime types
      await expect(hashPassword(null)).rejects.toThrow('Password must be a non-empty string');
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches hash', async () => {
      const hash = await hashPassword(plainPassword);
      const isValid = await verifyPassword(plainPassword, hash);

      expect(isValid).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const hash = await hashPassword(plainPassword);
      const isValid = await verifyPassword('WrongPassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should return false when given empty inputs', async () => {
      const hash = await hashPassword(plainPassword);

      expect(await verifyPassword('', hash)).toBe(false);
      expect(await verifyPassword(plainPassword, '')).toBe(false);
    });
  });
});
