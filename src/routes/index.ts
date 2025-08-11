// src/routes/index.ts

import { Router } from 'express';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';

const router = Router();

// Mount route modules
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router; 