import mongoose, { Document, Schema } from 'mongoose';

export type Role =
  | 'borrower'
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection';

export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  isEligible?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['borrower', 'admin', 'sales', 'sanction', 'disbursement', 'collection'],
      default: 'borrower',
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    monthlySalary: {
      type: Number,
    },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self-employed', 'unemployed'],
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);