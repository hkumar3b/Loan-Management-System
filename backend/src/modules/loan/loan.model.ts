import mongoose, { Document, Schema } from 'mongoose';

export type LoanStatus =
  | 'APPLIED'
  | 'SANCTIONED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'CLOSED';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;

  amount: number;
  tenure: number;
  interestRate: number;
  totalRepayment: number;

  salarySlipUrl: string;

  status: LoanStatus;
  rejectionReason?: string;

  appliedAt?: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },
    tenure: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },
    interestRate: {
      type: Number,
      default: 12,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },

    salarySlipUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['APPLIED', 'SANCTIONED', 'REJECTED', 'DISBURSED', 'CLOSED'],
      default: 'APPLIED',
    },
    rejectionReason: {
      type: String,
    },

    appliedAt: { type: Date },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILoan>('Loan', LoanSchema);