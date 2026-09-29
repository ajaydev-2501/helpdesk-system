import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with a secure salt.
 * Plaintext passwords must never be persisted to the database.
 *
 * @param password The plaintext password to hash
 * @param saltRounds Number of hashing rounds (default: 10)
 * @returns The resulting bcrypt hash string
 */
export async function hashPassword(
  password: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a plaintext password against an existing bcrypt hash.
 *
 * @param password The plaintext password attempting to authenticate
 * @param hash The stored bcrypt hash
 * @returns True if password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}
