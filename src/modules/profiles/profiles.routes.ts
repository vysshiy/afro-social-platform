import { Router } from 'express';
import { getProfile, updateMyProfile } from './profiles.controller';
import { authenticate } from '../../middleware/auth';

export const profilesRoutes = Router();

profilesRoutes.get('/:userId', getProfile);
profilesRoutes.patch('/me', authenticate, updateMyProfile);
