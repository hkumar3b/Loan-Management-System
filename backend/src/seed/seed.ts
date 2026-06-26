import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../modules/user/user.model';

dotenv.config();

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Sales Executive',
    email: 'sales@lms.com',
    password: 'sales123',
    role: 'sales',
  },
  {
    name: 'Sanction Executive',
    email: 'sanction@lms.com',
    password: 'sanction123',
    role: 'sanction',
  },
  {
    name: 'Disbursement Executive',
    email: 'disbursement@lms.com',
    password: 'disbursement123',
    role: 'disbursement',
  },
  {
    name: 'Collection Executive',
    email: 'collection@lms.com',
    password: 'collection123',
    role: 'collection',
  },
  {
    name: 'Test Borrower',
    email: 'borrower@lms.com',
    password: 'borrower123',
    role: 'borrower',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');

    // Clear existing seeded users by email
    const emails = seedUsers.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('Cleared existing seed users');

    // Hash passwords and insert
    const usersToInsert = await Promise.all(
      seedUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashedPassword };
      })
    );

    await User.insertMany(usersToInsert);

    console.log('\n✅ Seed complete! Login credentials:\n');
    console.table(
      seedUsers.map((u) => ({
        Role: u.role,
        Email: u.email,
        Password: u.password,
      }))
    );

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();