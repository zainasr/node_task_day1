// src/schemas/index.ts

import { z } from 'zod';

export const createCategorySchema = z.object({
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
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description must not be empty')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
});

export const createProductSchema = z.object({
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
    .positive('Price must be positive')
    .max(999999.99, 'Price must be less than 999999.99'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID format'),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description must not be empty')
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price must be less than 999999.99')
    .optional(),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>; 