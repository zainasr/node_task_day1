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
