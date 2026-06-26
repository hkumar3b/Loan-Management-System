import { Router } from 'express';
import { savePersonalDetails, getMyProfile } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Only borrowers can submit personal details
router.post(
  '/personal-details',
  authenticate,
  authorize('borrower'),
  savePersonalDetails
);

// Any logged in user can get their own profile
router.get('/me', authenticate, getMyProfile);

export default router;