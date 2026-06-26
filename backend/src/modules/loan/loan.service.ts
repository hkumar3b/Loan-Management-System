import Loan from './loan.model';
import Payment from '../payment/payment.model';
import { calculateTotalRepayment } from '../../utils/calculateLoan';
import { ApiResponse } from '../../utils/ApiResponse';
import User from '../user/user.model';

// ── Upload salary slip ────────────────────────────────────

export const uploadSalarySlipService = async (
  userId: string,
  filePath: string
) => {
  // Just return the file url — it gets attached when loan is applied
  const fileUrl = `/${filePath.replace(/\\/g, '/')}`;
  return new ApiResponse(true, 'Salary slip uploaded successfully', {
    salarySlipUrl: fileUrl,
  });
};

// ── Apply for loan ────────────────────────────────────────

export const applyLoanService = async (
  userId: string,
  data: {
    amount: number;
    tenure: number;
    salarySlipUrl: string;
  }
) => {
  // Check user is eligible (BRE passed)
  const user = await User.findById(userId);
  if (!user) {
    return new ApiResponse(false, 'User not found');
  }
  if (!user.isEligible) {
    return new ApiResponse(
      false,
      'You must complete personal details and pass eligibility check first'
    );
  }

  // Check if borrower already has an active loan
  const activeLoan = await Loan.findOne({
    borrowerId: userId,
    status: { $in: ['APPLIED', 'SANCTIONED', 'DISBURSED'] },
  });
  if (activeLoan) {
    return new ApiResponse(
      false,
      'You already have an active loan application'
    );
  }

  const totalRepayment = calculateTotalRepayment(data.amount, data.tenure);

  const loan = await Loan.create({
    borrowerId: userId,
    amount: data.amount,
    tenure: data.tenure,
    interestRate: 12,
    totalRepayment,
    salarySlipUrl: data.salarySlipUrl,
    status: 'APPLIED',
    appliedAt: new Date(),
  });

  return new ApiResponse(true, 'Loan application submitted successfully', loan);
};

// ── Get my loans ──────────────────────────────────────────

export const getMyLoansService = async (userId: string) => {
  const loans = await Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
  return new ApiResponse(true, 'Loans fetched successfully', loans);
};

// ── Get single loan with outstanding balance ──────────────

export const getLoanDetailsService = async (
  loanId: string,
  userId: string
) => {
  const loan = await Loan.findOne({
    _id: loanId,
    borrowerId: userId,
  }).populate('borrowerId', '-password');

  if (!loan) {
    return new ApiResponse(false, 'Loan not found');
  }

  // Calculate outstanding balance
  const payments = await Payment.find({ loanId: loan._id });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.round((loan.totalRepayment - totalPaid) * 100) / 100;

  return new ApiResponse(true, 'Loan details fetched', {
    loan,
    payments,
    totalPaid,
    outstanding,
  });
};