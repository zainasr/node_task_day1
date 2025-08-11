// tests/unit/data/categoryStore.test.ts

import { categoryStore, productStore } from '../../../src/data/store';
import { createTestCategory } from '../../setup/testSetup';

describe('categoryStore Unit Tests', () => {
  describe('create', () => {
    it('should create a category with valid data', () => {
      // Arrange
      const categoryData = createTestCategory({
        name: 'Electronics',
        description: 'Electronic devices'
      });

      // Act
      const result = categoryStore.create(categoryData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.id).toBeValidUUID();
      expect(result.name).toBe('Electronics');
      expect(result.description).toBe('Electronic devices');
      expect(result.createdAt).toBeValidDate();
      expect(result.updatedAt).toBeValidDate();
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should generate unique IDs for different categories', () => {
      // Arrange
      const category1Data = createTestCategory({ name: 'Electronics' });
      const category2Data = createTestCategory({ name: 'Clothing' });

      // Act
      const category1 = categoryStore.create(category1Data);
      const category2 = categoryStore.create(category2Data);

      // Assert
      expect(category1.id).not.toBe(category2.id);
    });

    it('should preserve input data exactly', () => {
      // Arrange
      const categoryData = createTestCategory({
        name: 'Test Category',
        description: 'Test Description'
      });

      // Act
      const result = categoryStore.create(categoryData);

      // Assert
      expect(result.name).toBe(categoryData.name);
      expect(result.description).toBe(categoryData.description);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no categories exist', () => {
      // Act
      const result = categoryStore.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all created categories', () => {
      // Arrange
      const category1 = categoryStore.create(createTestCategory({ name: 'Electronics' }));
      const category2 = categoryStore.create(createTestCategory({ name: 'Clothing' }));

      // Act
      const result = categoryStore.getAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(category1);
      expect(result).toContainEqual(category2);
    });
  });

  describe('getById', () => {
    it('should return category when it exists', () => {
      // Arrange
      const category = categoryStore.create(createTestCategory());

      // Act
      const result = categoryStore.getById(category.id);

      // Assert
      expect(result).toEqual(category);
    });

    it('should return undefined when category does not exist', () => {
      // Act
      const result = categoryStore.getById('nonexistent-id');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true when category exists', () => {
      // Arrange
      const category = categoryStore.create(createTestCategory());

      // Act
      const result = categoryStore.exists(category.id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category does not exist', () => {
      // Act
      const result = categoryStore.exists('nonexistent-id');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update category with new data', async () => {
      // Arrange
      const originalCategory = categoryStore.create(createTestCategory({
        name: 'Original Name',
        description: 'Original Description'
      }));
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      // Add a small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      // Act
      const result = categoryStore.update(originalCategory.id, updateData);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(originalCategory.id);
      expect(result!.name).toBe('Updated Name');
      expect(result!.description).toBe('Updated Description');
      expect(result!.createdAt).toEqual(originalCategory.createdAt);
      expect(result!.updatedAt.getTime()).toBeGreaterThan(originalCategory.updatedAt.getTime());
    });

    it('should update only provided fields', () => {
      // Arrange
      const originalCategory = categoryStore.create(createTestCategory({
        name: 'Original Name',
        description: 'Original Description'
      }));

      // Act - Update only name
      const result = categoryStore.update(originalCategory.id, { name: 'New Name' });

      // Assert
      expect(result!.name).toBe('New Name');
      expect(result!.description).toBe('Original Description'); // Should remain unchanged
    });

    it('should return null when category does not exist', () => {
      // Act
      const result = categoryStore.update('nonexistent-id', { name: 'New Name' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete category when it has no products', () => {
      // Arrange
      const category = categoryStore.create(createTestCategory());

      // Act
      const result = categoryStore.delete(category.id);

      // Assert
      expect(result).toBe(true);
      expect(categoryStore.getById(category.id)).toBeUndefined();
    });

    it('should not delete category when it has products', () => {
      // Arrange
      const category = categoryStore.create(createTestCategory());
      productStore.create({
        name: 'Test Product',
        description: 'Test',
        price: 100,
        stock: 10,
        categoryId: category.id
      });

      // Act
      const result = categoryStore.delete(category.id);

      // Assert
      expect(result).toBe(false);
      expect(categoryStore.getById(category.id)).toBeDefined();
    });

    it('should return false when category does not exist', () => {
      // Act
      const result = categoryStore.delete('nonexistent-id');

      // Assert
      expect(result).toBe(false);
    });
  });
}); 