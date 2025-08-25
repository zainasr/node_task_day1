// src/routes/productRoutes.ts

import { Router } from 'express';

import {
  createProductSchema,
  updateProductSchema,
} from '../validations_types/product.schema';
import { productController as controller } from '../container';
import { idParamSchema } from '../validations_types/common.schema';
import { cursorPaginationQuerySchema } from '../validations_types/common.schema';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validation';

const router = Router();

router.get('/', validateQuery(cursorPaginationQuerySchema), controller.getAll);
router.get('/:id', validateParams(idParamSchema), controller.getById);
router.get(
  '/:id/category',
  validateParams(idParamSchema),
  controller.getWithCategory
);
router.post('/', validateBody(createProductSchema), controller.create);
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  controller.update
);
router.delete('/:id', validateParams(idParamSchema), controller.delete);

export default router;
