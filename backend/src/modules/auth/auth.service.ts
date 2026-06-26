import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../user/user.model';
import { ApiResponse } from '../../utils/ApiResponse';

export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new ApiResponse(false, 'Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user — role defaults to 'borrower'
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user);

  return new ApiResponse(true, 'Registration successful', {
    token,
    user: sanitizeUser(user),
  });
};

export const loginService = async (email: string, password: string) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return new ApiResponse(false, 'Invalid email or password');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return new ApiResponse(false, 'Invalid email or password');
  }

  const token = generateToken(user);

  return new ApiResponse(true, 'Login successful', {
    token,
    user: sanitizeUser(user),
  });
};

// ── Helpers ──────────────────────────────────────────────

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );
};

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});