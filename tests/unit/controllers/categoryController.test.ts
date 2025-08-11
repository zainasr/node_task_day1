// tests/unit/controllers/categoryController.test.ts

import { Request, Response, NextFunction } from 'express';
import {
  getAllCategories,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../src/controllers/categoryController';
import { categoryStore, productStore } from '../../../src/data/store';
import * as responseUtils from '../../../src/utils/response';
import { mockCategory } from '../../setup/testSetup';

// Mock the store modules
jest.mock('../../../src/data/store', () => ({
  categoryStore: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  },
  productStore: {
    getByCategoryId: jest.fn(),
  },
}));

// Mock response utilities
jest.mock('../../../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('Category Controller Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories successfully', async () => {
      // Arrange
      const mockCategories = [mockCategory, { ...mockCategory, id: '2', name: 'Clothing' }];
      (categoryStore.getAll as jest.Mock).mockReturnValue(mockCategories);

      // Act
      await getAllCategories(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.getAll).toHaveBeenCalledTimes(1);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        mockCategories,
        'Categories retrieved successfully'
      );
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      (categoryStore.getAll as jest.Mock).mockReturnValue([]);

      // Act
      await getAllCategories(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.getAll).toHaveBeenCalledTimes(1);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        [],
        'Categories retrieved successfully'
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return category when it exists', async () => {
      // Arrange
      mockRequest.params = { id: mockCategory.id };
      (categoryStore.getById as jest.Mock).mockReturnValue(mockCategory);

      // Act
      await getCategoryById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.getById).toHaveBeenCalledWith(mockCategory.id);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        mockCategory,
        'Category retrieved successfully'
      );
    });

    it('should return 404 when category does not exist', async () => {
      // Arrange
      const nonexistentId = 'nonexistent-id';
      mockRequest.params = { id: nonexistentId };
      (categoryStore.getById as jest.Mock).mockReturnValue(undefined);

      // Act
      await getCategoryById(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.getById).toHaveBeenCalledWith(nonexistentId);
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Category not found',
        404
      );
    });
  });

  describe('getCategoryProducts', () => {
    it('should return products when category exists', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', categoryId: mockCategory.id },
        { id: '2', name: 'Product 2', categoryId: mockCategory.id },
      ];
      mockRequest.params = { id: mockCategory.id };
      (categoryStore.exists as jest.Mock).mockReturnValue(true);
      (productStore.getByCategoryId as jest.Mock).mockReturnValue(mockProducts);

      // Act
      await getCategoryProducts(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.exists).toHaveBeenCalledWith(mockCategory.id);
      expect(productStore.getByCategoryId).toHaveBeenCalledWith(mockCategory.id);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        mockProducts,
        'Category products retrieved successfully'
      );
    });

    it('should return 404 when category does not exist', async () => {
      // Arrange
      const nonexistentId = 'nonexistent-id';
      mockRequest.params = { id: nonexistentId };
      (categoryStore.exists as jest.Mock).mockReturnValue(false);

      // Act
      await getCategoryProducts(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.exists).toHaveBeenCalledWith(nonexistentId);
      expect(productStore.getByCategoryId).not.toHaveBeenCalled();
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Category not found',
        404
      );
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      // Arrange
      const categoryData = { name: 'Electronics', description: 'Electronic devices' };
      mockRequest.body = categoryData;
      (categoryStore.create as jest.Mock).mockReturnValue(mockCategory);

      // Act
      await createCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.create).toHaveBeenCalledWith(categoryData);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        mockCategory,
        'Category created successfully',
        201
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      // Arrange
      const updateData = { name: 'Updated Electronics' };
      const updatedCategory = { ...mockCategory, ...updateData };
      mockRequest.params = { id: mockCategory.id };
      mockRequest.body = updateData;
      (categoryStore.update as jest.Mock).mockReturnValue(updatedCategory);

      // Act
      await updateCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.update).toHaveBeenCalledWith(mockCategory.id, updateData);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        updatedCategory,
        'Category updated successfully'
      );
    });

    it('should return 400 when no update data provided', async () => {
      // Arrange
      mockRequest.params = { id: mockCategory.id };
      mockRequest.body = {};

      // Act
      await updateCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.update).not.toHaveBeenCalled();
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'No update data provided',
        400
      );
    });

    it('should return 404 when category does not exist', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      mockRequest.params = { id: 'nonexistent-id' };
      mockRequest.body = updateData;
      (categoryStore.update as jest.Mock).mockReturnValue(null);

      // Act
      await updateCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.update).toHaveBeenCalledWith('nonexistent-id', updateData);
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Category not found',
        404
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      // Arrange
      mockRequest.params = { id: mockCategory.id };
      (categoryStore.exists as jest.Mock).mockReturnValue(true);
      (categoryStore.delete as jest.Mock).mockReturnValue(true);

      // Act
      await deleteCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.exists).toHaveBeenCalledWith(mockCategory.id);
      expect(categoryStore.delete).toHaveBeenCalledWith(mockCategory.id);
      expect(responseUtils.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        null,
        'Category deleted successfully'
      );
    });

    it('should return 404 when category does not exist', async () => {
      // Arrange
      const nonexistentId = 'nonexistent-id';
      mockRequest.params = { id: nonexistentId };
      (categoryStore.exists as jest.Mock).mockReturnValue(false);

      // Act
      await deleteCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.exists).toHaveBeenCalledWith(nonexistentId);
      expect(categoryStore.delete).not.toHaveBeenCalled();
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Category not found',
        404
      );
    });

    it('should return 400 when category has products', async () => {
      // Arrange
      mockRequest.params = { id: mockCategory.id };
      (categoryStore.exists as jest.Mock).mockReturnValue(true);
      (categoryStore.delete as jest.Mock).mockReturnValue(false);

      // Act
      await deleteCategory(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(categoryStore.exists).toHaveBeenCalledWith(mockCategory.id);
      expect(categoryStore.delete).toHaveBeenCalledWith(mockCategory.id);
      expect(responseUtils.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Cannot delete category with existing products',
        400
      );
    });
  });
}); 