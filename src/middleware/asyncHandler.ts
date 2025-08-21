// src/middleware/asyncHandler.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper that catches errors and passes them to error middleware
 * Eliminates the need for try-catch blocks in controllers
 */
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
