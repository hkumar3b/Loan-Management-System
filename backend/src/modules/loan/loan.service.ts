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

// ── Sanction Module ───────────────────────────────────────

export const getAppliedLoansService = async () => {
  const loans = await Loan.find({ status: 'APPLIED' })
    .populate('borrowerId', '-password')
    .sort({ appliedAt: -1 });
  return new ApiResponse(true, 'Applied loans fetched', loans);
};

export const sanctionLoanService = async (
  loanId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
) => {
  const loan = await Loan.findById(loanId);
  if (!loan) return new ApiResponse(false, 'Loan not found');
  if (loan.status !== 'APPLIED') {
    return new ApiResponse(false, 'Only APPLIED loans can be sanctioned or rejected');
  }

  if (action === 'approve') {
    loan.status = 'SANCTIONED';
    loan.sanctionedAt = new Date();
  } else {
    if (!rejectionReason) {
      return new ApiResponse(false, 'Rejection reason is required');
    }
    loan.status = 'REJECTED';
    loan.rejectionReason = rejectionReason;
  }

  await loan.save();
  return new ApiResponse(
    true,
    action === 'approve' ? 'Loan sanctioned successfully' : 'Loan rejected',
    loan
  );
};

// ── Disbursement Module ───────────────────────────────────

export const getSanctionedLoansService = async () => {
  const loans = await Loan.find({ status: 'SANCTIONED' })
    .populate('borrowerId', '-password')
    .sort({ sanctionedAt: -1 });
  return new ApiResponse(true, 'Sanctioned loans fetched', loans);
};

export const disburseLoanService = async (loanId: string) => {
  const loan = await Loan.findById(loanId);
  if (!loan) return new ApiResponse(false, 'Loan not found');
  if (loan.status !== 'SANCTIONED') {
    return new ApiResponse(false, 'Only SANCTIONED loans can be disbursed');
  }

  loan.status = 'DISBURSED';
  loan.disbursedAt = new Date();
  await loan.save();

  return new ApiResponse(true, 'Loan disbursed successfully', loan);
};

// ── Collection Module ─────────────────────────────────────

export const getDisbursedLoansService = async () => {
  const loans = await Loan.find({ status: { $in: ['DISBURSED', 'CLOSED'] } })
    .populate('borrowerId', '-password')
    .sort({ disbursedAt: -1 });

  // Attach outstanding balance to each loan
  const loansWithBalance = await Promise.all(
    loans.map(async (loan) => {
      const payments = await Payment.find({ loanId: loan._id });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding =
        Math.round((loan.totalRepayment - totalPaid) * 100) / 100;
      return {
        ...loan.toObject(),
        totalPaid,
        outstanding,
        payments,
      };
    })
  );

  return new ApiResponse(true, 'Disbursed loans fetched', loansWithBalance);
};

export const recordPaymentService = async (
  loanId: string,
  data: {
    utrNumber: string;
    amount: number;
    paymentDate: string;
  }
) => {
  const loan = await Loan.findById(loanId);
  if (!loan) return new ApiResponse(false, 'Loan not found');
  if (loan.status !== 'DISBURSED') {
    return new ApiResponse(false, 'Payments can only be recorded for DISBURSED loans');
  }

  // Check UTR uniqueness
  const existingPayment = await Payment.findOne({ utrNumber: data.utrNumber.toUpperCase() });
  if (existingPayment) {
    return new ApiResponse(false, 'UTR number already exists. Duplicate payment not allowed');
  }

  // Get total paid so far
  const previousPayments = await Payment.find({ loanId });
  const totalPaidSoFar = previousPayments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.round((loan.totalRepayment - totalPaidSoFar) * 100) / 100;

  // Validate amount
  if (data.amount <= 0) {
    return new ApiResponse(false, 'Payment amount must be greater than 0');
  }
  if (data.amount > outstanding) {
    return new ApiResponse(
      false,
      `Payment amount (₹${data.amount}) exceeds outstanding balance (₹${outstanding})`
    );
  }

  // Record payment
  const payment = await Payment.create({
    loanId,
    utrNumber: data.utrNumber.toUpperCase(),
    amount: data.amount,
    paymentDate: new Date(data.paymentDate),
  });

  // Check if loan should auto-close
  const newTotalPaid = totalPaidSoFar + data.amount;
  const newOutstanding =
    Math.round((loan.totalRepayment - newTotalPaid) * 100) / 100;

  if (newOutstanding <= 0) {
    loan.status = 'CLOSED';
    loan.closedAt = new Date();
    await loan.save();
  }

  return new ApiResponse(true, 'Payment recorded successfully', {
    payment,
    totalPaid: newTotalPaid,
    outstanding: newOutstanding,
    loanStatus: loan.status,
  });
};