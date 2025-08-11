// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);

  return sendError(
    res,
    'Internal server error',
    500,
    env.NODE_ENV === 'development' ? error.message : undefined
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
}; 