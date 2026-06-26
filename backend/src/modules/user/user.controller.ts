import { Request, Response } from 'express';
import {
  savePersonalDetailsService,
  getUserProfileService,
} from './user.service';

export const savePersonalDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pan, dob, monthlySalary, employmentMode } = req.body;

    if (!pan || !dob || !monthlySalary || !employmentMode) {
      res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
      return;
    }

    const result = await savePersonalDetailsService(req.user!.id, {
      pan,
      dob,
      monthlySalary: Number(monthlySalary),
      employmentMode,
    });

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getUserProfileService(req.user!.id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};