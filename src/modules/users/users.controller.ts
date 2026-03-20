import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { UpdateUserSchema, getUserById, updateUser } from './users.service';

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = UpdateUserSchema.parse(req.body);
    const user = await updateUser(req.user!.userId, input);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
