import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// --- Mock @prisma/client before importing app ---
const mockUser = {
  id: 'user-cuid-1',
  email: 'alice@example.com',
  passwordHash: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const db: {
  users: Map<string, typeof mockUser>;
  tokens: Map<string, { token: string; userId: string; expiresAt: Date }>;
} = {
  users: new Map(),
  tokens: new Map(),
};

vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email) {
          for (const u of db.users.values()) if (u.email === where.email) return Promise.resolve(u);
        }
        if (where.id) return Promise.resolve(db.users.get(where.id) ?? null);
        return Promise.resolve(null);
      }),
      findUniqueOrThrow: vi.fn(({ where }: { where: { id: string } }) => {
        const u = db.users.get(where.id);
        if (!u) throw new Error('Not found');
        return Promise.resolve(u);
      }),
      create: vi.fn(({ data }: { data: { email: string; passwordHash: string } }) => {
        const user = { ...mockUser, id: `uid-${Date.now()}`, email: data.email, passwordHash: data.passwordHash };
        db.users.set(user.id, user);
        return Promise.resolve(user);
      }),
    },
    refreshToken: {
      findUnique: vi.fn(({ where }: { where: { token: string } }) =>
        Promise.resolve(db.tokens.get(where.token) ?? null)
      ),
      create: vi.fn(({ data }: { data: { token: string; userId: string; expiresAt: Date } }) => {
        db.tokens.set(data.token, data);
        return Promise.resolve(data);
      }),
      delete: vi.fn(({ where }: { where: { token: string } }) => {
        db.tokens.delete(where.token);
        return Promise.resolve({});
      }),
      deleteMany: vi.fn(({ where }: { where: { token: string } }) => {
        db.tokens.delete(where.token);
        return Promise.resolve({ count: 1 });
      }),
    },
  }));
  return { PrismaClient };
});

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters!';
});

beforeEach(() => {
  db.users.clear();
  db.tokens.clear();
});

const { default: app } = await import('../src/index.js');

describe('POST /auth/register', () => {
  it('creates a user and returns tokens', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'bob@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/auth/register').send({ email: 'bob@example.com', password: 'password123' });
    const res = await request(app).post('/auth/register').send({ email: 'bob@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid email', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'x@x.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    await request(app).post('/auth/register').send({ email: 'alice@example.com', password: 'mypassword' });
    const res = await request(app).post('/auth/login').send({ email: 'alice@example.com', password: 'mypassword' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('rejects wrong password', async () => {
    await request(app).post('/auth/register').send({ email: 'alice@example.com', password: 'mypassword' });
    const res = await request(app).post('/auth/login').send({ email: 'alice@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'nobody@example.com', password: 'whatever' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/refresh', () => {
  it('rotates refresh token and returns new tokens', async () => {
    const reg = await request(app).post('/auth/register').send({ email: 'eve@example.com', password: 'password123' });
    const oldRefresh = reg.body.refreshToken;

    const res = await request(app).post('/auth/refresh').send({ refreshToken: oldRefresh });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.refreshToken).not.toBe(oldRefresh);
  });

  it('rejects invalid refresh token', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken: 'fakefake' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('invalidates the refresh token', async () => {
    const reg = await request(app).post('/auth/register').send({ email: 'carol@example.com', password: 'password123' });
    const refreshToken = reg.body.refreshToken;

    const logoutRes = await request(app).post('/auth/logout').send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    // Token is gone — refresh should fail
    const refreshRes = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});
