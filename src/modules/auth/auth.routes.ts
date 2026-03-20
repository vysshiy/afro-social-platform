import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller';
import { authenticate } from '../../middleware/auth';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', authenticate, logout);
