// src/controllers/category.controller.ts

import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validations_types/category.schema';
import { IdParamInput } from '../validations_types/common.schema';
import { PaginationQuery } from '../validations_types/common.schema';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query as unknown as PaginationQuery;
    await this.categoryService.getAll(res, page, limit);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.categoryService.getById(id, res);
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.categoryService.getWithProducts(id, res);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateCategoryInput;
    await this.categoryService.create(data, res);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    const data = req.body as UpdateCategoryInput;
    await this.categoryService.update(id, data, res);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.categoryService.remove(id, res);
  });
}
