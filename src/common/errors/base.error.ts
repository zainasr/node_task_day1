// src/common/errors/base.error.ts
import { env } from '../../config/env';
/**
 * Base error class for all application errors
 * Provides common structure and HTTP status code mapping
 */
export abstract class BaseError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
  
    constructor(
      message: string,
      statusCode: number,
      errorCode: string,
      isOperational: boolean = true
    ) {
      super(message);
      
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.isOperational = isOperational;
      this.timestamp = new Date();
  
      // Maintain proper stack trace (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
    /**
     * Convert error to JSON format for API responses
     */
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        errorCode: this.errorCode,
        timestamp: this.timestamp.toISOString(),
            ...(env.NODE_ENV === 'development' && { stack: this.stack }),
      };
    }
  }