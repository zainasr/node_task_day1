import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { categories } from '../schema/categories';
import { products } from '../schema/products';
import { Category } from '../schema/categories';
import * as schema from '../schema';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../validations_types/category.schema';

import {
  CategoryNotFoundError,
  CategoryHasProductsError,
  DuplicateCategoryError,
  DatabaseError,
} from '../../common/errors';

import { sendSuccess, CategoryResponses } from '../../utils/response';
import logger from '../../utils/logger';

export class CategoryRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Get all categories - handles everything including response
   */
  async findAll(res: Response): Promise<void> {
    try {
      logger.debug('Fetching all categories');
      const result = await this.db.select().from(categories);

      logger.info('Categories fetched successfully', {
        count: result.length,
      });
      const responseData = CategoryResponses.getAll(result);
      sendSuccess(res, responseData);
    } catch (error) {
      logger.error('Failed to fetch categories', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to fetch categories from database',
        error,
        'FETCH_ERROR',
        'findAll'
      );
    }
  }

  /**
   * Get category by ID - handles everything including response
   */
  async findById(id: string, res: Response): Promise<void> {
    try {
      logger.debug('Fetching category by ID', { categoryId: id });

      const result = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      const category = result[0];
      if (!category) {
        logger.warn('Category not found', { categoryId: id });
        throw new CategoryNotFoundError(id);
      }

      logger.info('Category fetched successfully', {
        categoryId: id,
        categoryName: category.name,
      });
      const responseData = CategoryResponses.getById(category);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }

      logger.error('Failed to fetch category', {
        categoryId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to fetch category from database',
        error,
        'FETCH_ERROR',
        'findById'
      );
    }
  }

  /**
   * Get category with its products - handles everything including response
   */
  async findWithProducts(id: string, res: Response): Promise<void> {
    try {
      logger.debug('Fetching category with products by ID', { categoryId: id });
      const result = await this.db.query.categories.findFirst({
        where: eq(categories.id, id),
        with: {
          products: true,
        },
      });

      if (!result) {
        logger.warn('Category with products not found', { categoryId: id });
        throw new CategoryNotFoundError(id);
      }

      logger.info('Category with products fetched successfully', {
        categoryId: id,
        categoryName: result.name,
      });
      const responseData = CategoryResponses.getProducts(result.products);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }

      logger.error('Failed to fetch category with products', {
        categoryId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to fetch category with products from database',
        error,
        'FETCH_WITH_RELATIONS_ERROR',
        'findWithProducts'
      );
    }
  }

  /**
   * Create new category - handles everything including response
   */
  async create(data: CreateCategoryInput, res: Response): Promise<void> {
    try {
      logger.debug('Creating new category', { categoryName: data.name });
      // Check for duplicate name only (essential business rule)
      const existingCategory = await this.findByName(data.name);
      if (existingCategory) {
        logger.warn('Duplicate category name found', {
          categoryName: data.name,
        });
        throw new DuplicateCategoryError(data.name);
      }

      const [result] = await this.db
        .insert(categories)
        .values(data)
        .returning();

      logger.info('Category created successfully', {
        categoryId: result?.id,
        categoryName: result?.name,
      });
      const responseData = CategoryResponses.create(result as Category);
      sendSuccess(res, responseData);
    } catch (error) {
      if (error instanceof DuplicateCategoryError) {
        throw error;
      }

      logger.error('Failed to create category', {
        categoryName: data.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to create category in database',
        error,
        'CREATE_ERROR',
        'create'
      );
    }
  }

  /**
   * Update existing category - handles everything including response
   */
  async update(
    id: string,
    data: UpdateCategoryInput,
    res: Response
  ): Promise<void> {
    try {
      logger.debug('Updating category', {
        categoryId: id,
        updatedFields: Object.keys(data),
      });
      // Check for duplicate name only if name is being updated
      if (data && data['name']) {
        const existingCategory = await this.findByName(data['name']);
        if (existingCategory && existingCategory.id !== id) {
          logger.warn('Duplicate category name found during update', {
            categoryName: data['name'],
            existingCategoryId: existingCategory.id,
          });
          throw new DuplicateCategoryError(data['name']);
        }
      }

      const [result] = await this.db
        .update(categories)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id))
        .returning();

      if (!result) {
        logger.warn('Category not found for update', { categoryId: id });
        throw new CategoryNotFoundError(id);
      }

      logger.info('Category updated successfully', {
        categoryId: id,
        categoryName: result.name,
      });
      const responseData = CategoryResponses.update(result as Category);
      sendSuccess(res, responseData);
    } catch (error) {
      if (
        error instanceof CategoryNotFoundError ||
        error instanceof DuplicateCategoryError
      ) {
        throw error;
      }

      logger.error('Failed to update category', {
        categoryId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to update category in database',
        error,
        'UPDATE_ERROR',
        'update'
      );
    }
  }

  /**
   * Delete category - handles everything including response
   */
  async delete(id: string, res: Response): Promise<void> {
    try {
      logger.debug('Deleting category', { categoryId: id });
      // Check for associated products (essential business rule)
      const hasProducts = await this.db.query.products.findFirst({
        where: eq(products.categoryId, id),
      });

      if (hasProducts) {
        logger.warn('Category has associated products, cannot delete', {
          categoryId: id,
        });
        throw new CategoryHasProductsError(id);
      }

      const [result] = await this.db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

      if (!result) {
        logger.warn('Category not found for deletion', { categoryId: id });
        throw new CategoryNotFoundError(id);
      }

      logger.info('Category deleted successfully', { categoryId: id });
      const responseData = CategoryResponses.delete();
      sendSuccess(res, responseData);
    } catch (error) {
      if (
        error instanceof CategoryNotFoundError ||
        error instanceof CategoryHasProductsError
      ) {
        throw error;
      }

      logger.error('Failed to delete category', {
        categoryId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        'Failed to delete category from database',
        error,
        'DELETE_ERROR',
        'delete'
      );
    }
  }

  /**
   * Helper method to find category by name
   * @private
   */
  private async findByName(name: string): Promise<Category | null> {
    try {
      logger.debug('Finding category by name', { categoryName: name });
      const result = await this.db
        .select()
        .from(categories)
        .where(eq(categories.name, name))
        .limit(1);

      logger.info('Category found by name', {
        categoryName: name,
        categoryId: result[0]?.id,
      });
      return result[0] || null;
    } catch (error) {
      logger.error('Failed to find category by name', {
        categoryName: name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}
