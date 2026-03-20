import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AuthTokens, JwtPayload, UserRole } from '../../types';

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RefreshSchema = z.object({
  refreshToken: z.string(),
});

function generateTokens(payload: JwtPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function registerUser(input: z.infer<typeof RegisterSchema>) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existingUser) {
    throw new AppError(409, 'Email or username already taken');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
      profile: {
        create: {
          displayName: input.displayName,
        },
      },
    },
    include: { profile: true },
  });

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  };

  const tokens = generateTokens(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    },
    ...tokens,
  };
}

export async function loginUser(input: z.infer<typeof LoginSchema>) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
    throw new AppError(403, 'Account is suspended or banned');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  };

  const tokens = generateTokens(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    },
    ...tokens,
  };
}

export async function refreshTokens(token: string) {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status === 'SUSPENDED' || user.status === 'BANNED') {
    throw new AppError(401, 'User not found or account inactive');
  }

  const newPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  };

  return generateTokens(newPayload);
}
