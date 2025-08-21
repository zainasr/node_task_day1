// src/routes/index.ts

import { Router } from 'express';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import { createAuthRouter } from './authRoutes';
import { authController, authMiddleware } from '../container';

const router = Router();

// Mount route modules
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/auth', createAuthRouter(authController, authMiddleware));

export default router;
