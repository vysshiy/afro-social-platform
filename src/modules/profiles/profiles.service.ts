import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ProfileType } from '../../types';

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  profileType: z.nativeEnum(ProfileType).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
});

export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }

  return profile;
}

export async function updateProfile(userId: string, input: z.infer<typeof UpdateProfileSchema>) {
  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }

  return prisma.profile.update({
    where: { userId },
    data: input,
  });
}
