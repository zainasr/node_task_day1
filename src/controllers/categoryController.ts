// src/controllers/categoryController.ts

import { Request, Response, NextFunction } from 'express';
import { categoryStore, productStore } from '../data/store';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  IdParamInput,
} from '../schemas';

export const getAllCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const categories = categoryStore.getAll();
    sendSuccess(res, categories, 'Categories retrieved successfully');
  }
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;
    const category = categoryStore.getById(id);

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, category, 'Category retrieved successfully');
  }
);

export const getCategoryProducts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;
    
    if (!categoryStore.exists(id)) {
      sendError(res, 'Category not found', 404);
      return;
    }

    const products = productStore.getByCategoryId(id);
    sendSuccess(res, products, 'Category products retrieved successfully');
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, description } = req.body as CreateCategoryInput;

    const category = categoryStore.create({ name, description });
    sendSuccess(res, category, 'Category created successfully', 201);
  }
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;
    const updateData = req.body as UpdateCategoryInput;

    if (Object.keys(updateData).length === 0) {
      sendError(res, 'No update data provided', 400);
      return;
    }

    // Filter out undefined values to match store interface
    const filteredData: { name?: string; description?: string } = {};
    if (updateData.name !== undefined) filteredData.name = updateData.name;
    if (updateData.description !== undefined) filteredData.description = updateData.description;

    const updatedCategory = categoryStore.update(id, filteredData);

    if (!updatedCategory) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, updatedCategory, 'Category updated successfully');
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { id } = req.params as IdParamInput;

    if (!categoryStore.exists(id)) {
      sendError(res, 'Category not found', 404);
      return;
    }

    const deleted = categoryStore.delete(id);

    if (!deleted) {
      sendError(
        res,
        'Cannot delete category with existing products',
        400
      );
      return;
    }

    sendSuccess(res, null, 'Category deleted successfully');
  }
); 