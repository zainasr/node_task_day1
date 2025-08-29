// src/container.ts

import { db } from './db';
import { CategoryRepository } from './db/repositories/category.repository';
import { ProductRepository } from './db/repositories/product.repository';
import { UserRepository } from './db/repositories/user.repository';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { PaymentRepository } from './db/repositories/payment.repository';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';

// Repositories
const categoryRepository = new CategoryRepository(db);
const productRepository = new ProductRepository(db);
const userRepository = new UserRepository(db);
const paymentRepository = new PaymentRepository(db);

// Services
const categoryService = new CategoryService(categoryRepository);
const productService = new ProductService(productRepository);
export const authService = new AuthService(userRepository);
const paymentService = new PaymentService(paymentRepository);

// Middleware
export const authMiddleware = new AuthMiddleware(authService);

// Controllers
export const categoryController = new CategoryController(categoryService);
export const productController = new ProductController(productService);
export const authController = new AuthController(authService);
export const paymentController = new PaymentController(paymentService);
