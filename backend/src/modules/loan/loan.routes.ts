import { Router } from 'express';
import {
  uploadSalarySlip,
  applyLoan,
  getMyLoans,
  getLoanDetails,
  getAppliedLoans,
  sanctionLoan,
  getSanctionedLoans,
  disburseLoan,
  getDisbursedLoans,
  recordPayment,
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
router.post(
  '/upload-salary-slip',
  authenticate,
  authorize('borrower'),
  upload.single('salarySlip'),
  uploadSalarySlip
);

router.post('/apply', authenticate, authorize('borrower'), applyLoan);
router.get('/my-loans', authenticate, authorize('borrower'), getMyLoans);
router.get('/:loanId', authenticate, authorize('borrower'), getLoanDetails);

// ── Sanction module ───────────────────────────────────────
router.get(
  '/dashboard/applied',
  authenticate,
  authorize('admin', 'sanction'),
  getAppliedLoans
);

router.patch(
  '/dashboard/:loanId/sanction',
  authenticate,
  authorize('admin', 'sanction'),
  sanctionLoan
);

// ── Disbursement module ───────────────────────────────────
router.get(
  '/dashboard/sanctioned',
  authenticate,
  authorize('admin', 'disbursement'),
  getSanctionedLoans
);

router.patch(
  '/dashboard/:loanId/disburse',
  authenticate,
  authorize('admin', 'disbursement'),
  disburseLoan
);

// ── Collection module ─────────────────────────────────────
router.get(
  '/dashboard/disbursed',
  authenticate,
  authorize('admin', 'collection'),
  getDisbursedLoans
);

router.post(
  '/dashboard/:loanId/payment',
  authenticate,
  authorize('admin', 'collection'),
  recordPayment
);

export default router;