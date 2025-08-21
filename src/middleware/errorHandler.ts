// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { BaseError } from '../common/errors';
import logger from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log the error with context
  logger.error('Application error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle custom errors
  if (error instanceof BaseError) {
    return sendError(res, error.message, error.statusCode, error.errorCode);
  }

  // Handle unknown errors
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

  return sendError(res, message, 500, 'INTERNAL_ERROR');
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  return sendError(
    res,
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
};
