export interface BREInput {
  dob: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

export interface BREResult {
  passed: boolean;
  reason?: string;
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const getAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const runBRE = (input: BREInput): BREResult => {
  const age = getAge(new Date(input.dob));

  if (age < 23 || age > 50) {
    return { passed: false, reason: 'Age must be between 23 and 50 years.' };
  }

  if (input.monthlySalary < 25000) {
    return { passed: false, reason: 'Monthly salary must be at least ₹25,000.' };
  }

  if (!PAN_REGEX.test(input.pan.toUpperCase())) {
    return { passed: false, reason: 'Invalid PAN format. Expected format: ABCDE1234F' };
  }

  if (input.employmentMode === 'unemployed') {
    return { passed: false, reason: 'Unemployed applicants are not eligible for a loan.' };
  }

  return { passed: true };
};