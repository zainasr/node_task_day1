// src/routes/categoryRoutes.ts

import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { validateBody, validateParams } from '../middleware/validation';
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} from '../schemas';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', validateParams(idParamSchema), getCategoryById);

// GET /api/categories/:id/products - Get products in a category
router.get('/:id/products', validateParams(idParamSchema), getCategoryProducts);

// POST /api/categories - Create new category
router.post('/', validateBody(createCategorySchema), createCategory);

// PUT /api/categories/:id - Update category
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  updateCategory
);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', validateParams(idParamSchema), deleteCategory);

export default router; 