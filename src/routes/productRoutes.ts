// src/routes/productRoutes.ts

import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { validateBody, validateParams } from '../middleware/validation';
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
} from '../schemas';

const router = Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', validateParams(idParamSchema), getProductById);

// POST /api/products - Create new product
router.post('/', validateBody(createProductSchema), createProduct);

// PUT /api/products/:id - Update product
router.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  updateProduct
);

// DELETE /api/products/:id - Delete product
router.delete('/:id', validateParams(idParamSchema), deleteProduct);

export default router; 