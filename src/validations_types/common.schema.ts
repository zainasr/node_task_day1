// src/schemas/common.schema.ts
import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */

// ID parameter validation (for route params)
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Type inference
export type IdParamInput = z.infer<typeof idParamSchema>;

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '1', 10)),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '10', 10)),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const cursorPaginationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '10', 10)),
  cursor: z.string().optional(),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;
