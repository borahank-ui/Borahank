import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/auth/hash.js';

describe('hashPassword / verifyPassword', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('supersecret');
    expect(hash).not.toBe('supersecret');
    expect(await verifyPassword('supersecret', hash)).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correcthorsebatterystaple');
    expect(await verifyPassword('wrongpassword', hash)).toBe(false);
  });

  it('produces different hashes for same input (salted)', async () => {
    const h1 = await hashPassword('same');
    const h2 = await hashPassword('same');
    expect(h1).not.toBe(h2);
  });
});
