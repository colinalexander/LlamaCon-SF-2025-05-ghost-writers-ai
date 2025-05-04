import crypto from 'crypto';

// Generate a random salt
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password with salt using PBKDF2
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(
    password,
    salt,
    10000, // iterations
    64,    // key length
    'sha512'
  ).toString('hex');
}

// Verify password
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
}
