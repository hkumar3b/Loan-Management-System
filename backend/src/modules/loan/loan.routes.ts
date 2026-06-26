import { Router } from 'express';
import {
  uploadSalarySlip,
  applyLoan,
  getMyLoans,
  getLoanDetails,
} from './loan.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { upload } from '../../config/multer';

const router = Router();

// Borrower routes
router.post(
  '/upload-salary-slip',
  authenticate,
  authorize('borrower'),
  upload.single('salarySlip'),
  uploadSalarySlip
);

router.post(
  '/apply',
  authenticate,
  authorize('borrower'),
  applyLoan
);

router.get(
  '/my-loans',
  authenticate,
  authorize('borrower'),
  getMyLoans
);

router.get(
  '/:loanId',
  authenticate,
  authorize('borrower'),
  getLoanDetails
);

export default router;