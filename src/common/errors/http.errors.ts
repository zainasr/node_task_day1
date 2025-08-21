// src/common/errors/http.errors.ts
import { BaseError } from './base.error';

/**
 * 400 Bad Request - Client sent invalid data
 * Use when: Invalid input, malformed requests, business rule violations
 */
export class BadRequestError extends BaseError {
  constructor(
    message: string = 'Bad Request',
    errorCode: string = 'BAD_REQUEST'
  ) {
    super(message, 400, errorCode);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 * Use when: Missing/invalid token, expired session
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message: string = 'Unauthorized',
    errorCode: string = 'UNAUTHORIZED'
  ) {
    super(message, 401, errorCode);
  }
}

/**
 * 403 Forbidden - User lacks permission
 * Use when: User authenticated but lacks required role/permission
 */
export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 * Use when: Entity not found in database, invalid resource ID
 */
export class NotFoundError extends BaseError {
  constructor(
    message: string = 'Resource not found',
    errorCode: string = 'NOT_FOUND'
  ) {
    super(message, 404, errorCode);
  }
}

/**
 * 409 Conflict - Resource conflict
 * Use when: Duplicate entries, constraint violations
 */
export class ConflictError extends BaseError {
  constructor(
    message: string = 'Resource conflict',
    errorCode: string = 'CONFLICT'
  ) {
    super(message, 409, errorCode);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 * Use when: Data format correct but validation rules failed
 */
export class ValidationError extends BaseError {
  public readonly validationErrors?: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    validationErrors: Array<{ field: string; message: string }>,
    errorCode: string = 'VALIDATION_ERROR'
  ) {
    super(message, 422, errorCode);
    this.validationErrors = validationErrors;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * 500 Internal Server Error - Unexpected server errors
 * Use when: Database failures, external service failures, unexpected errors
 */
export class InternalServerError extends BaseError {
  public readonly originalError?: unknown;

  constructor(
    message: string = 'Internal server error',
    originalError?: unknown,
    errorCode: string = 'INTERNAL_ERROR'
  ) {
    super(message, 500, errorCode, false); // Not operational
    this.originalError = originalError;
  }

   override toJSON() {
    return {
      ...super.toJSON(),
    //   ...(env.NODE_ENV === 'development' &&
    //     this.originalError && {
    //       originalError: this.originalError.toString(),
    //     })
       
    };
  }
}
