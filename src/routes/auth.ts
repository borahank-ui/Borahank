import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../auth/hash.js';
import {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
} from '../auth/tokens.js';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiresAt() },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  res.status(201).json({ accessToken, refreshToken });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiresAt() },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  res.json({ accessToken, refreshToken });
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { refreshToken } = result.data;
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
  const newRefreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt: refreshTokenExpiresAt() },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  res.json({ accessToken, refreshToken: newRefreshToken });
});

// POST /auth/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const result = refreshSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { refreshToken } = result.data;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  res.json({ message: 'Logged out' });
});

export default router;
