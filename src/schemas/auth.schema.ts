// src/schemas/auth.schema.ts
import { z } from 'zod';

/**
 * Authentication validation schemas
 */

// OAuth profile schema (for validating incoming OAuth profile data)
export const oauthProfileSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  picture: z.string().url('Invalid URL format').optional(),
  provider: z.string().min(1, 'Provider is required').max(50, 'Provider name too long'),
  providerId: z.string().min(1, 'Provider ID is required').max(255, 'Provider ID too long'),
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  sub: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
  }),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Type inference
export type OAuthProfileInput = z.infer<typeof oauthProfileSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

// Export a unified object for easy access
export const authSchemas = {
  oauthProfile: oauthProfileSchema,
  jwtPayload: jwtPayloadSchema,
}; 