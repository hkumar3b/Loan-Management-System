import User from './user.model';
import { runBRE } from '../../utils/bre';
import { ApiResponse } from '../../utils/ApiResponse';
import Loan from '../loan/loan.model';

export const savePersonalDetailsService = async (
  userId: string,
  data: {
    pan: string;
    dob: string;
    monthlySalary: number;
    employmentMode: string;
  }
) => {
  // Run BRE first
  const breResult = runBRE({
    dob: new Date(data.dob),
    monthlySalary: data.monthlySalary,
    pan: data.pan,
    employmentMode: data.employmentMode,
  });

  if (!breResult.passed) {
    return new ApiResponse(false, breResult.reason as string);
  }

  // BRE passed — save details and mark eligible
  const user = await User.findByIdAndUpdate(
    userId,
    {
      pan: data.pan.toUpperCase(),
      dob: new Date(data.dob),
      monthlySalary: data.monthlySalary,
      employmentMode: data.employmentMode,
      isEligible: true,
    },
    { new: true }
  ).select('-password');

  if (!user) {
    return new ApiResponse(false, 'User not found');
  }

  return new ApiResponse(true, 'Personal details saved successfully', user);
};

export const getUserProfileService = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    return new ApiResponse(false, 'User not found');
  }
  return new ApiResponse(true, 'User profile fetched', user);
};

// Sales module — users who registered but haven't applied yet
export const getLeadsService = async () => {

  const borrowers = await User.find({ role: 'borrower' }).select('-password');

  const loanBorrowerIds = await Loan.distinct('borrowerId');

  const leads = borrowers.filter(
    (user) => !loanBorrowerIds.some((id) => id.toString() === user._id.toString())
  );

  return new ApiResponse(true, 'Leads fetched successfully', leads);
};