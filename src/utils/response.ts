// src/utils/response.ts

import { Response } from 'express';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
  pagination?: any; // Add pagination support
};

/**
 * Enhanced response structure for different operations
 */
export interface ResponseData<T = any> {
  data: T;
  message: string;
  statusCode: number;
  pagination?: any; // Add pagination support
}

/**
 * Generic success response sender
 */
export const sendSuccess = <T>(
  res: Response,
  responseData: ResponseData<T>
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message: responseData.message,
    data: responseData.data,
    ...(responseData.pagination && { pagination: responseData.pagination }), // Include pagination if present
  };
  return res.status(responseData.statusCode).json(response);
};

/**
 * Generic error response sender
 */
export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    ...(error ? { error } : {}),
  };
  return res.status(statusCode).json(response);
};

/**
 * Validation error response sender
 * Used by validation middleware for Zod validation failures
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ path: string; message: string }>,
  message: string = 'Validation failed'
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: errors.map((err) => err.message).join(', '),
    errors: errors,
  };
  return res.status(422).json(response);
};

/**
 * Authentication error response sender
 */
export const sendAuthError = (
  res: Response,
  message: string = 'Authentication required',
  statusCode: number = 401
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: message,
  };
  return res.status(statusCode).json(response);
};

/**
 * Not found error response sender
 */
export const sendNotFoundError = (
  res: Response,
  resource: string = 'Resource'
): Response => {
  const message = `${resource} not found`;
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: message,
  };
  return res.status(404).json(response);
};

/**
 * Conflict error response sender
 */
export const sendConflictError = (
  res: Response,
  message: string = 'Resource conflict'
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: message,
  };
  return res.status(409).json(response);
};

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPaginationMetadata {
  nextCursor?: string;
  prevCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

// Response helper functions for different entities and operations
export const CategoryResponses = {
  getAll: (data: any[]) => ({
    data,
    message: 'Categories retrieved successfully',
    statusCode: 200,
  }),
  /**
   * Get all categories with pagination metadata
   */
  getAllWithPagination: (
    categories: any[],
    pagination: PaginationMetadata
  ) => ({
    data: categories,
    message: `Categories retrieved successfully (Page ${pagination.page} of ${pagination.totalPages})`,
    statusCode: 200,
    pagination,
  }),

  getById: (data: any) => ({
    data,
    message: 'Category retrieved successfully',
    statusCode: 200,
  }),

  getProducts: (data: any[]) => ({
    data,
    message: 'Category products retrieved successfully',
    statusCode: 200,
  }),

  create: (data: any) => ({
    data,
    message: 'Category created successfully',
    statusCode: 201,
  }),

  update: (data: any) => ({
    data,
    message: 'Category updated successfully',
    statusCode: 200,
  }),

  delete: () => ({
    data: null,
    message: 'Category deleted successfully',
    statusCode: 200,
  }),
};

export const ProductResponses = {
  getAll: (data: any[]) => ({
    data,
    message: 'Products retrieved successfully',
    statusCode: 200,
  }),
  /**
   * Get all products with cursor pagination metadata
   */
  getAllWithCursorPagination: (
    products: any[],
    pagination: CursorPaginationMetadata
  ) => ({
    data: products,
    message: `Products retrieved successfully (${products.length} items)`,
    statusCode: 200,
    pagination, // This will be included in the response
  }),

  getById: (data: any) => ({
    data,
    message: 'Product retrieved successfully',
    statusCode: 200,
  }),

  create: (data: any) => ({
    data,
    message: 'Product created successfully',
    statusCode: 201,
  }),

  update: (data: any) => ({
    data,
    message: 'Product updated successfully',
    statusCode: 200,
  }),

  delete: () => ({
    data: null,
    message: 'Product deleted successfully',
    statusCode: 200,
  }),
};

export const AuthResponses = {
  login: (data: any) => ({
    data,
    message: 'Login successful',
    statusCode: 200,
  }),

  logout: () => ({
    data: null,
    message: 'Logout successful',
    statusCode: 200,
  }),

  profile: (data: any) => ({
    data,
    message: 'Profile retrieved successfully',
    statusCode: 200,
  }),

  register: (data: any) => ({
    data,
    message: 'Registration successful',
    statusCode: 201,
  }),
};

export const UserResponses = {
  getAll: (data: any[]) => ({
    data,
    message: 'Users retrieved successfully',
    statusCode: 200,
  }),

  getById: (data: any) => ({
    data,
    message: 'User retrieved successfully',
    statusCode: 200,
  }),

  update: (data: any) => ({
    data,
    message: 'User updated successfully',
    statusCode: 200,
  }),

  delete: () => ({
    data: null,
    message: 'User deleted successfully',
    statusCode: 200,
  }),
};
