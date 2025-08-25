import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validation';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations_types/category.schema';
import { idParamSchema } from '../validations_types/common.schema';
import { paginationQuerySchema } from '../validations_types/common.schema';
import { categoryController as controller } from '../container';

const router = Router();

// Add pagination query validation
router.get('/', validateQuery(paginationQuerySchema), controller.getAll);

// GET /api/categories/:id - Get category by ID
router.get('/:id', validateParams(idParamSchema), controller.getById);

// GET /api/categories/:id/products - Get category products
router.get(
  '/:id/products',
  validateParams(idParamSchema),
  controller.getProducts
);

// POST /api/categories - Create new category
router.post('/', validateBody(createCategorySchema), controller.create);

// PUT /api/categories/:id - Update category
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  controller.update
);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', validateParams(idParamSchema), controller.delete);

export default router;
