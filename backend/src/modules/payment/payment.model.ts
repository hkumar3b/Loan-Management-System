import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  loanId: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,        
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);