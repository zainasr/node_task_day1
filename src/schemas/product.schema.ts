// src/schemas/product.schema.ts
import { z } from 'zod';

/**
 * Product validation schemas
 */

// Base schema with common validations
const productBaseSchema = {
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  price: z
    .number()
    .int('Price must be an integer') // ✅ ADDED: Must be integer
    .positive('Price must be positive')
    .max(999999, 'Price must be less than 999999'), // ✅ CHANGED: Max value for integer
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID format'),
};

// Schema for creating a new product
export const createProductSchema = z.object(productBaseSchema);

// Schema for updating an existing product (all fields optional)
export const updateProductSchema = z.object({
  ...Object.fromEntries(
    Object.entries(productBaseSchema).map(([key, value]) => [
      key,
      value.optional(),
    ])
  ),
});

// Type inference
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Export a unified object for easy access
export const productSchemas = {
  create: createProductSchema,
  update: updateProductSchema,
};
