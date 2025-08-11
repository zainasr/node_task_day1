// src/controllers/productController.ts

import { Request, Response, NextFunction } from 'express';
import { productStore, categoryStore } from '../data/store';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  CreateProductInput,
  UpdateProductInput,
  IdParamInput,
} from '../schemas';

export const getAllProducts = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const products = productStore.getAll();
    sendSuccess(res, products, 'Products retrieved successfully');
  }
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput
    const product = productStore.getById(id);

    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    sendSuccess(res, product, 'Product retrieved successfully');
  }
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, description, price, stock, categoryId } = req.body as CreateProductInput;

    // Validate category exists
    if (!categoryStore.exists(categoryId)) {
      sendError(res, 'Category not found', 400);
      return;
    }

    const product = productStore.create({
      name,
      description,
      price,
      stock,
      categoryId,
    });

    sendSuccess(res, product, 'Product created successfully', 201);
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;
    const updateData = req.body as UpdateProductInput;

    if (Object.keys(updateData).length === 0) {
      sendError(res, 'No update data provided', 400);
      return;
    }

    // Validate category exists if categoryId is being updated
    if (updateData.categoryId && !categoryStore.exists(updateData.categoryId)) {
      sendError(res, 'Category not found', 400);
      return;
    }

    // Filter out undefined values to match store interface
    const filteredData: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
    } = {};
    
    if (updateData.name !== undefined) filteredData.name = updateData.name;
    if (updateData.description !== undefined) filteredData.description = updateData.description;
    if (updateData.price !== undefined) filteredData.price = updateData.price;
    if (updateData.stock !== undefined) filteredData.stock = updateData.stock;
    if (updateData.categoryId !== undefined) filteredData.categoryId = updateData.categoryId;

    const updatedProduct = productStore.update(id, filteredData);

    if (!updatedProduct) {
      sendError(res, 'Product not found', 404);
      return;
    }

    sendSuccess(res, updatedProduct, 'Product updated successfully');
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;

    if (!productStore.exists(id)) {
      sendError(res, 'Product not found', 404);
      return;
    }

    productStore.delete(id);
    sendSuccess(res, null, 'Product deleted successfully');
  }
); 