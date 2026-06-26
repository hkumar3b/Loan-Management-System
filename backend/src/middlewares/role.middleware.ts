import { Request, Response, NextFunction } from 'express';
import { Role } from '../modules/user/user.model';
import { ApiResponse } from '../utils/ApiResponse';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(new ApiResponse(false, 'Not authenticated'));
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res
        .status(403)
        .json(
          new ApiResponse(false, 'Access denied. You do not have permission.')
        );
      return;
    }

    next();
  };
};