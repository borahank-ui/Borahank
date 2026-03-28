import { describe, it, expect, beforeAll } from 'vitest';
import { signAccessToken, verifyAccessToken, generateRefreshToken, refreshTokenExpiresAt } from '../src/auth/tokens.js';

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters!!';
});

describe('signAccessToken / verifyAccessToken', () => {
  it('signs and verifies a token', () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.com');
  });

  it('throws on tampered token', () => {
    const token = signAccessToken({ sub: 'x', email: 'x@x.com' });
    expect(() => verifyAccessToken(token + 'tampered')).toThrow();
  });
});

describe('generateRefreshToken', () => {
  it('generates a 128-char hex string', () => {
    const token = generateRefreshToken();
    expect(token).toHaveLength(128);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('generates unique tokens each time', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });
});

describe('refreshTokenExpiresAt', () => {
  it('returns a date ~7 days in the future', () => {
    const now = Date.now();
    const expires = refreshTokenExpiresAt().getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expires - now).toBeGreaterThan(sevenDaysMs - 1000);
    expect(expires - now).toBeLessThan(sevenDaysMs + 1000);
  });
});
