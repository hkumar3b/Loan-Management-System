import { Request, Response } from 'express';
import {
  uploadSalarySlipService,
  applyLoanService,
  getMyLoansService,
  getLoanDetailsService,
  getAppliedLoansService,
  sanctionLoanService,
  getSanctionedLoansService,
  getDisbursedLoansService,
  recordPaymentService,
  disburseLoanService,
} from './loan.service';

export const uploadSalarySlip = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadSalarySlipService(
      req.user!.id,
      req.file.path
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLoan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, tenure, salarySlipUrl } = req.body;

    if (!amount || !tenure || !salarySlipUrl) {
      res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
      return;
    }

    const result = await applyLoanService(req.user!.id, {
      amount: Number(amount),
      tenure: Number(tenure),
      salarySlipUrl,
    });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyLoans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getMyLoansService(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLoanDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { loanId } = req.params;
    if (typeof loanId !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid loan ID' });
      return;
    }

    const result = await getLoanDetailsService(
      loanId,
      req.user!.id
    );
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Sanction ──────────────────────────────────────────────

export const getAppliedLoans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getAppliedLoansService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const sanctionLoan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { action, rejectionReason } = req.body;
    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be approve or reject' });
      return;
    }

    const { loanId } = req.params;
    if (typeof loanId !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid loan ID' });
      return;
    }

    const result = await sanctionLoanService(
      loanId,
      action,
      rejectionReason
    );
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Disbursement ──────────────────────────────────────────

export const getSanctionedLoans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getSanctionedLoansService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const disburseLoan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { loanId } = req.params;
    if (typeof loanId !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid loan ID' });
      return;
    }
    const result = await disburseLoanService(loanId);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Collection ────────────────────────────────────────────

export const getDisbursedLoans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getDisbursedLoansService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const recordPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !amount || !paymentDate) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const { loanId } = req.params;
    if (typeof loanId !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid loan ID' });
      return;
    }

    const result = await recordPaymentService(loanId, {
      utrNumber,
      amount: Number(amount),
      paymentDate,
    });

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};