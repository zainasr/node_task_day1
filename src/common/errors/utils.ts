// src/common/errors/utils.ts

import { BaseError } from './base.error';

/**
 * Type guard to check if error is operational (expected) or programming error
 * Operational errors: Expected errors that should be handled gracefully
 * Programming errors: Bugs that should crash the application
 */
export function isOperationalError(error: unknown): error is BaseError {
  return error instanceof BaseError && error.isOperational;
}

/**
 * Extract HTTP status code from any error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof BaseError) {
    return error.statusCode;
  }
  
  // Default to 500 for unknown errors
  return 500;
}

/**
 * Extract error code from any error
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof BaseError) {
    return error.errorCode;
  }
  return 'UNKNOWN_ERROR';
}