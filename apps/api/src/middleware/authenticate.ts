import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { AppError } from '../lib/errors';

declare global {
  namespace Express {
    interface Request {
      uid: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing authorization token'));
  }

  const token = header.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
