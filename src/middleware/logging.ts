// src/middleware/logging.ts

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * HTTP request logging middleware
 * Logs incoming requests and their responses
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Capture response details
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;

    // Log response
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: body ? body.length : 0,
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Error logging middleware
 * Logs errors with stack traces
 */
export const errorLogger = (
  error: Error,
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  logger.error('Request error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    ip: req.ip,
  });

  next(error);
};
