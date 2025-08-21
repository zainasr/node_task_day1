import { Response } from 'express';
import { ProductRepository } from '../db/repositories/product.repository';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../schemas/product.schema';

export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getAll(res: Response): Promise<void> {
    return this.productRepo.findAll(res);
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
