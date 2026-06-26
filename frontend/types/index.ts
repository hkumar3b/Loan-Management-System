export type Role =
  | 'borrower'
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  pan?: string;
  dob?: string;
  monthlySalary?: number;
  employmentMode?: string;
  isEligible?: boolean;
  createdAt?: string;
}

export interface Loan {
  _id: string;
  borrowerId: User | string;
  amount: number;
  tenure: number;
  interestRate: number;
  totalRepayment: number;
  salarySlipUrl: string;
  status: 'APPLIED' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';
  rejectionReason?: string;
  appliedAt?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  totalPaid?: number;
  outstanding?: number;
}

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}