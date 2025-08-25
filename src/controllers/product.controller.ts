// src/controllers/product.controller.ts

import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../validations_types/product.schema';
import { IdParamInput } from '../validations_types/common.schema';
import {
 
  CursorPaginationQuery,
} from '../validations_types/common.schema';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const {
      limit = 10,
      cursor,
      direction = 'next',
    } = req.query as unknown as CursorPaginationQuery;
    await this.productService.getAll(res, limit, cursor, direction);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.productService.getById(id, res);
  });

  getWithCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.productService.getWithCategory(id, res);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateProductInput;
    await this.productService.create(data, res);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    const data = req.body as UpdateProductInput;
    await this.productService.update(id, data, res);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as IdParamInput;
    await this.productService.remove(id, res);
  });
}
