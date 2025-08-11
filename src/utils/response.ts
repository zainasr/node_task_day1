// src/utils/response.ts

import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: string[],
  message: string = 'Validation failed'
): Response => {
  return sendError(res, message, 400, errors.join(', '));
}; 