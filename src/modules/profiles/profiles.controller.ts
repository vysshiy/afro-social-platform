import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { UpdateProfileSchema, getProfileByUserId, updateProfile } from './profiles.service';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getProfileByUserId(req.params.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = UpdateProfileSchema.parse(req.body);
    const profile = await updateProfile(req.user!.userId, input);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
