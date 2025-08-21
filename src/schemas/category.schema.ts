// src/schemas/category.schema.ts
import { z } from 'zod';


/**
 * Category validation schemas
 */

// Base schema with common validations
const categoryBaseSchema = {
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
};

// Schema for creating a new category
export const createCategorySchema = z.object(categoryBaseSchema);

// Schema for updating an existing category (all fields optional)
export const updateCategorySchema = z.object({
  ...Object.fromEntries(
    Object.entries(categoryBaseSchema).map(([key, value]) => [
      key,
      value.optional(),
    ])
  ),
});

// Type inference
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Export a unified object for easy access
export const categorySchemas = {
  create: createCategorySchema,
  update: updateCategorySchema,
};
