// src/common/errors/database.error.ts

import { InternalServerError } from './http.errors';

/**
 * Enhanced database error with proper HTTP status mapping
 * Replaces the old DatabaseError class
 */
export class DatabaseError extends InternalServerError {
  public readonly code?: string;
  public readonly operation?: string;

  constructor(
    message: string,
    originalError?: unknown,
    code?: string,
    operation?: string
  ) {
    super(message, originalError, 'DATABASE_ERROR');
    this.code = code || '';
    this.operation = operation || '';
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      code: this.code,
      operation: this.operation,
    };
  }
}

/**
 * Database connection specific error
 */
export class DatabaseConnectionError extends DatabaseError {
  constructor(originalError?: unknown) {
    super(
      'Database connection failed',
      originalError,
      'CONNECTION_ERROR',
      'connect'
    );
  }
}

/**
 * Database query specific error
 */
export class DatabaseQueryError extends DatabaseError {
  constructor(query: string, originalError?: unknown) {
    super(
      `Database query failed: ${query}`,
      originalError,
      'QUERY_ERROR',
      'query'
    );
  }
}
