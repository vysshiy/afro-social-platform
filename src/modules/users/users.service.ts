import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().optional(),
});

const userSelect = {
  id: true,
  email: true,
  username: true,
  status: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
} as const;

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

export async function updateUser(id: string, input: z.infer<typeof UpdateUserSchema>) {
  if (input.username) {
    const existing = await prisma.user.findFirst({
      where: { username: input.username, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'Username already taken');
  }

  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id } },
    });
    if (existing) throw new AppError(409, 'Email already taken');
  }

  return prisma.user.update({
    where: { id },
    data: input,
    select: userSelect,
  });
}
