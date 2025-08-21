// src/services/category.service.ts

import { Response } from 'express';
import { CategoryRepository } from '../db/repositories/category.repository';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validations_types/category.schema';
import logger from '../utils/logger';

export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getAll(res: Response): Promise<void> {
    logger.debug('CategoryService: Getting all categories');
    return this.categoryRepo.findAll(res);
  }

  async getById(id: string, res: Response): Promise<void> {
    logger.debug('CategoryService: Getting category by ID', { categoryId: id });
    return this.categoryRepo.findById(id, res);
  }

  async getWithProducts(id: string, res: Response): Promise<void> {
    return this.categoryRepo.findWithProducts(id, res);
  }

  async create(data: CreateCategoryInput, res: Response): Promise<void> {
    return this.categoryRepo.create(data, res);
  }

  async update(
    id: string,
    data: UpdateCategoryInput,
    res: Response
  ): Promise<void> {
    return this.categoryRepo.update(id, data, res);
  }

  async remove(id: string, res: Response): Promise<void> {
    return this.categoryRepo.delete(id, res);
  }
}
