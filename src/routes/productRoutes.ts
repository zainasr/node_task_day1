// src/routes/productRoutes.ts

import { Router } from 'express';

import {
  createProductSchema,
  updateProductSchema,
} from '../schemas/product.schema';
import { productController as controller } from '../container';
import { idParamSchema } from '../schemas/common.schema';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

router.get('/', controller.getAll);
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
