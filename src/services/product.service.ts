import { Response } from 'express';
import { ProductRepository } from '../db/repositories/product.repository';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../validations_types/product.schema';

export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getAll(
    res: Response,
    limit: number = 10,
    cursor?: string,
    direction: 'next' | 'prev' = 'next'
  ): Promise<void> {
    return this.productRepo.findAll(res, limit, cursor, direction);
  }

  async getById(id: string, res: Response): Promise<void> {
    return this.productRepo.findById(id, res);
  }

  async getWithCategory(id: string, res: Response): Promise<void> {
    return this.productRepo.findWithCategory(id, res);
  }

  async getByCategory(categoryId: string, res: Response): Promise<void> {
    return this.productRepo.findByCategory(categoryId, res);
  }

  async create(data: CreateProductInput, res: Response): Promise<void> {
    return this.productRepo.create(data, res);
  }

  async update(
    id: string,
    data: UpdateProductInput,
    res: Response
  ): Promise<void> {
    return this.productRepo.update(id, data, res);
  }

  async remove(id: string, res: Response): Promise<void> {
    return this.productRepo.delete(id, res);
  }
}
