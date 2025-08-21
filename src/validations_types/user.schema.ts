// src/schemas/user.schema.ts
import { z } from 'zod';

/**
 * User validation schemas
 */

// Base schema with common validations
const userBaseSchema = {
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  picture: z.string().url('Invalid URL format').optional(),
  provider: z
    .string()
    .min(1, 'Provider is required')
    .max(50, 'Provider name too long'),
  providerId: z
    .string()
    .min(1, 'Provider ID is required')
    .max(255, 'Provider ID too long'),
  role: z
    .enum(['user', 'admin'], {
      errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
    })
    .default('user'),
};

// Schema for creating a new user
export const createUserSchema = z.object(userBaseSchema);

// Schema for updating an existing user (all fields optional)
export const updateUserSchema = z.object({
  ...Object.fromEntries(
    Object.entries(userBaseSchema).map(([key, value]) => [
      key,
      value.optional(),
    ])
  ),
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Export a unified object for easy access
export const userSchemas = {
  create: createUserSchema,
  update: updateUserSchema,
};
