import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  InternalServerError,
} from './http.errors';

/**
 * Domain-specific business logic errors
 * These extend HTTP errors with specific business context
 */

// Category-specific errors
export class CategoryNotFoundError extends NotFoundError {
  constructor(categoryId: string) {
    super(`Category with ID '${categoryId}' not found`, 'CATEGORY_NOT_FOUND');
  }
}

export class CategoryHasProductsError extends ConflictError {
  constructor(categoryId: string) {
    super(
      `Cannot delete category '${categoryId}' because it has associated products`,
      'CATEGORY_HAS_PRODUCTS'
    );
  }
}

export class DuplicateCategoryError extends ConflictError {
  constructor(categoryName: string) {
    super(
      `Category with name '${categoryName}' already exists`,
      'DUPLICATE_CATEGORY'
    );
  }
}

// Product-specific errors
export class ProductNotFoundError extends NotFoundError {
  constructor(productId: string) {
    super(`Product with ID '${productId}' not found`, 'PRODUCT_NOT_FOUND');
  }
}

export class InvalidProductDataError extends BadRequestError {
  constructor(reason: string) {
    super(`Invalid product data: ${reason}`, 'INVALID_PRODUCT_DATA');
  }
}

export class DuplicateProductError extends ConflictError {
  constructor(productName: string, categoryId: string) {
    super(
      `Product with name '${productName}' already exists in category '${categoryId}'`,
      'DUPLICATE_PRODUCT'
    );
  }
}

export class ProductOutOfStockError extends ConflictError {
  constructor(productId: string) {
    super(`Product '${productId}' is out of stock`, 'PRODUCT_OUT_OF_STOCK');
  }
}

// User-specific errors
export class UserNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`User '${identifier}' not found`, 'USER_NOT_FOUND');
  }
}

export class DuplicateUserError extends ConflictError {
  constructor(email: string) {
    super(`User with email '${email}' already exists`, 'DUPLICATE_USER');
  }
}

export class InvalidUserDataError extends BadRequestError {
  constructor(reason: string) {
    super(`Invalid user data: ${reason}`, 'INVALID_USER_DATA');
  }
}

export class UserEmailNotVerifiedError extends ForbiddenError {
  constructor(email: string) {
    super(`Email '${email}' is not verified`, 'EMAIL_NOT_VERIFIED');
  }
}

export class UserAccountDisabledError extends ForbiddenError {
  constructor(userId: string) {
    super(`User account '${userId}' is disabled`, 'ACCOUNT_DISABLED');
  }
}

// Authentication-specific errors
export class InvalidTokenError extends UnauthorizedError {
  constructor() {
    super('Invalid or expired authentication token', 'INVALID_TOKEN');
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('Authentication token has expired', 'TOKEN_EXPIRED');
  }
}

export class InsufficientPermissionsError extends ForbiddenError {
  constructor(requiredRole: string) {
    super(
      `Insufficient permissions. Required role: ${requiredRole}`,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

export class AuthenticationError extends UnauthorizedError {
  constructor(reason: string) {
    super(`Authentication failed: ${reason}`, 'AUTHENTICATION_ERROR');
  }
}

export class AuthenticationRequiredError extends UnauthorizedError {
  constructor() {
    super(
      'Authentication is required to access this resource',
      'AUTHENTICATION_REQUIRED'
    );
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid username or password', 'INVALID_CREDENTIALS');
  }
}

export class AccountLockedError extends ForbiddenError {
  constructor(reason: string) {
    super(`Account is locked: ${reason}`, 'ACCOUNT_LOCKED');
  }
}

// OAuth-specific errors
export class OAuthError extends UnauthorizedError {
  constructor(provider: string, reason: string) {
    super(
      `OAuth authentication failed with ${provider}: ${reason}`,
      'OAUTH_ERROR'
    );
  }
}

export class OAuthProviderError extends InternalServerError {
  constructor(provider: string, error: string) {
    super(
      `OAuth provider ${provider} error: ${error}`,
      undefined,
      'OAUTH_PROVIDER_ERROR'
    );
  }
}

export class InvalidOAuthStateError extends BadRequestError {
  constructor() {
    super('Invalid OAuth state parameter', 'INVALID_OAUTH_STATE');
  }
}

// Token-specific errors
export class TokenGenerationError extends InternalServerError {
  constructor(reason: string) {
    super(
      `Token generation failed: ${reason}`,
      undefined,
      'TOKEN_GENERATION_ERROR'
    );
  }
}

export class TokenValidationError extends UnauthorizedError {
  constructor(reason: string) {
    super(`Token validation failed: ${reason}`, 'TOKEN_VALIDATION_ERROR');
  }
}

export class RefreshTokenNotFoundError extends UnauthorizedError {
  constructor() {
    super('Refresh token not found', 'REFRESH_TOKEN_NOT_FOUND');
  }
}

export class RefreshTokenExpiredError extends UnauthorizedError {
  constructor() {
    super('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
  }
}

// Session-specific errors
export class SessionNotFoundError extends UnauthorizedError {
  constructor() {
    super('Session not found or expired', 'SESSION_NOT_FOUND');
  }
}

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super('Session has expired', 'SESSION_EXPIRED');
  }
}

export class MaxSessionsExceededError extends ForbiddenError {
  constructor(maxSessions: number) {
    super(
      `Maximum number of active sessions (${maxSessions}) exceeded`,
      'MAX_SESSIONS_EXCEEDED'
    );
  }
}

// Password-specific errors (for future password authentication)
export class WeakPasswordError extends BadRequestError {
  constructor(requirements: string) {
    super(
      `Password does not meet requirements: ${requirements}`,
      'WEAK_PASSWORD'
    );
  }
}

export class PasswordMismatchError extends BadRequestError {
  constructor() {
    super('Password confirmation does not match', 'PASSWORD_MISMATCH');
  }
}

export class SamePasswordError extends BadRequestError {
  constructor() {
    super(
      'New password must be different from current password',
      'SAME_PASSWORD'
    );
  }
}

// Rate limiting errors
export class RateLimitExceededError extends BadRequestError {
  constructor(operation: string, retryAfter?: number) {
    const message = retryAfter
      ? `Rate limit exceeded for ${operation}. Try again in ${retryAfter} seconds.`
      : `Rate limit exceeded for ${operation}`;
    super(message, 'RATE_LIMIT_EXCEEDED');
  }
}

export class TooManyAttemptsError extends BadRequestError {
  constructor(operation: string, lockoutTime?: number) {
    const message = lockoutTime
      ? `Too many failed attempts for ${operation}. Account locked for ${lockoutTime} minutes.`
      : `Too many failed attempts for ${operation}`;
    super(message, 'TOO_MANY_ATTEMPTS');
  }
}

// Permission-specific errors
export class ResourceAccessDeniedError extends ForbiddenError {
  constructor(resource: string) {
    super(`Access denied to resource: ${resource}`, 'RESOURCE_ACCESS_DENIED');
  }
}

export class OwnershipRequiredError extends ForbiddenError {
  constructor(resource: string) {
    super(
      `You must be the owner of ${resource} to perform this action`,
      'OWNERSHIP_REQUIRED'
    );
  }
}

export class AdminRequiredError extends ForbiddenError {
  constructor() {
    super('Administrator privileges required', 'ADMIN_REQUIRED');
  }
}
