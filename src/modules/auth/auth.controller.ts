import { Request, Response, NextFunction } from 'express';
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  registerUser,
  loginUser,
  refreshTokens,
} from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = RegisterSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = LoginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = RefreshSchema.parse(req.body);
    const tokens = await refreshTokens(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  res.json({ success: true, message: 'Logged out successfully' });
}
