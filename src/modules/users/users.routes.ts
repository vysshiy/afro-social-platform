import { Router } from 'express';
import { getMe, getUser, updateMe } from './users.controller';
import { authenticate } from '../../middleware/auth';

export const usersRoutes = Router();

usersRoutes.get('/me', authenticate, getMe);
usersRoutes.patch('/me', authenticate, updateMe);
usersRoutes.get('/:id', getUser);
