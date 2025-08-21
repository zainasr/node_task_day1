import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { Response } from 'express';
import { products } from '../schema/products';
import { categories } from '../schema/categories';
import { Product } from '../schema/products';
import * as schema from '../schema';
import {
  CreateProductInput,
  UpdateProductInput,
} from '../../validations_types/product.schema';
import {
  ProductNotFoundError,
  CategoryNotFoundError,
  DuplicateProductError,
  InvalidProductDataError,
  DatabaseError,
} from '../../common/errors';
import { sendSuccess, ProductResponses } from '../../utils/response';
export class ProductRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Get all products - handles everything including response
   */
  async findAll(res: Response): Promise<void> {
    try {
      const allProducts = await this.db.select().from(products);
      const responseData = ProductResponses.getAll(allProducts);
      sendSuccess(res, responseData);
    } catch (error) {
      throw new DatabaseError(
        'Failed to fetch products from database',
        error,
        'FETCH_ERROR',
        'findAll'
      );
    }
  }

  /**
   * Get product by ID - handles everything including response
   */
  async findById(id: string, res: Response): Promise<void> {
    try {
      const result = await this.db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      const product = result[0];
      if (!product) {
        throw new ProductNotFoundError(id);
      }

      const responseData = ProductResponses.getById(product);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to fetch product from database',
        error,
        'FETCH_ERROR',
        'findById'
      );
    }
  }

  /**
   * Get product with category - handles everything including response
   */
  async findWithCategory(id: string, res: Response): Promise<void> {
    try {
      const result = await this.db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          category: true,
        },
      });

      if (!result) {
        throw new ProductNotFoundError(id);
      }

      const responseData = ProductResponses.getById(result);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to fetch product with category from database',
        error,
        'FETCH_WITH_RELATIONS_ERROR',
        'findWithCategory'
      );
    }
  }

  /**
   * Get products by category - handles everything including response
   */
  async findByCategory(categoryId: string, res: Response): Promise<void> {
    try {
      // Verify category exists first
      const categoryExists = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (!categoryExists.length) {
        throw new CategoryNotFoundError(categoryId);
      }

      const categoryProducts = await this.db
        .select()
        .from(products)
        .where(eq(products.categoryId, categoryId));

      const responseData = ProductResponses.getAll(categoryProducts);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to fetch products by category from database',
        error,
        'FETCH_BY_CATEGORY_ERROR',
        'findByCategory'
      );
    }
  }

  /**
   * Create new product - handles everything including response
   */
  async create(data: CreateProductInput, res: Response): Promise<void> {
    try {
      // Verify category exists
      const categoryExists = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, data['categoryId']))
        .limit(1);

      if (!categoryExists.length) {
        throw new CategoryNotFoundError(data['categoryId']);
      }

      // Check for duplicate name in the same category
      const existingProduct = await this.findByNameInCategory(
        data['name'],
        data['categoryId']
      );
      if (existingProduct) {
        throw new DuplicateProductError(data['name'], data['categoryId']);
      }

      // Validate business rules
      if (data['price'] <= 0) {
        throw new InvalidProductDataError('Price must be greater than 0');
      }

      if (data['price'] > 999999) {
        // ✅ UPDATED: Max integer value
        throw new InvalidProductDataError('Price cannot exceed 999999');
      }

      if (data['stock'] < 0) {
        throw new InvalidProductDataError('Stock cannot be negative');
      }

      const [result] = await this.db.insert(products).values(data).returning();

      const responseData = ProductResponses.create(result as Product);
      sendSuccess(res, responseData);
    } catch (error) {
      if (
        error instanceof CategoryNotFoundError ||
        error instanceof DuplicateProductError ||
        error instanceof InvalidProductDataError
      ) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to create product in database',
        error,
        'CREATE_ERROR',
        'create'
      );
    }
  }

  /**
   * Update existing product - handles everything including response
   */
  async update(
    id: string,
    data: UpdateProductInput,
    res: Response
  ): Promise<void> {
    try {
      // Verify category exists if categoryId is being updated
      if (data['categoryId']) {
        const categoryExists = await this.db
          .select()
          .from(categories)
          .where(eq(categories.id, data['categoryId'] as string))
          .limit(1);

        if (!categoryExists.length) {
          throw new CategoryNotFoundError(data['categoryId'] as string);
        }
      }

      // Check for duplicate name if name is being updated
      if (data['name'] && data['categoryId']) {
        const existingProduct = await this.findByNameInCategory(
          data['name'] as string,
          data['categoryId'] as string
        );
        if (existingProduct && existingProduct.id !== id) {
          throw new DuplicateProductError(
            data['name'] as string,
            data['categoryId'] as string
          );
        }
      }

      // Validate business rules
      if (data['price'] !== undefined && (data['price'] as number) <= 0) {
        throw new InvalidProductDataError('Price must be greater than 0');
      }

      if (data['price'] !== undefined && (data['price'] as number) > 999999) {
        // ✅ UPDATED
        throw new InvalidProductDataError('Price cannot exceed 999999');
      }

      if (data['stock'] !== undefined && (data['stock'] as number) < 0) {
        throw new InvalidProductDataError('Stock cannot be negative');
      }

      const [result] = await this.db
        .update(products)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      if (!result) {
        throw new ProductNotFoundError(id);
      }

      const responseData = ProductResponses.update(result as Product);
      sendSuccess(res, responseData);
    } catch (error) {
      if (
        error instanceof ProductNotFoundError ||
        error instanceof CategoryNotFoundError ||
        error instanceof DuplicateProductError ||
        error instanceof InvalidProductDataError
      ) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to update product in database',
        error,
        'UPDATE_ERROR',
        'update'
      );
    }
  }

  /**
   * Delete product - handles everything including response
   */
  async delete(id: string, res: Response): Promise<void> {
    try {
      const [result] = await this.db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      if (!result) {
        throw new ProductNotFoundError(id);
      }

      const responseData = ProductResponses.delete();
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw error;
      }

      throw new DatabaseError(
        'Failed to delete product from database',
        error,
        'DELETE_ERROR',
        'delete'
      );
    }
  }

  /**
   * Helper method to find product by name in a specific category
   * @private
   */
  private async findByNameInCategory(
    name: string,
    categoryId: string
  ): Promise<Product | null> {
    try {
      const result = await this.db
        .select()
        .from(products)
        .where(
          and(eq(products.name, name), eq(products.categoryId, categoryId))
        )
        .limit(1);

      return result[0] || null;
    } catch (error) {
      return null;
    }
  }
}
