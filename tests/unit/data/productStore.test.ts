// tests/unit/data/productStore.test.ts

import { categoryStore, productStore } from '../../../src/data/store';
import { createTestCategory, createTestProduct } from '../../setup/testSetup';

describe('productStore Unit Tests', () => {
  let testCategory: any;

  beforeEach(() => {
    // Create a test category for products
    testCategory = categoryStore.create(createTestCategory({
      name: 'Test Category',
      description: 'For testing products'
    }));
  });

  describe('create', () => {
    it('should create a product with valid data', () => {
      // Arrange
      const productData = createTestProduct(testCategory.id, {
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50
      });

      // Act
      const result = productStore.create(productData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.id).toBeValidUUID();
      expect(result.name).toBe('iPhone 15');
      expect(result.description).toBe('Latest smartphone');
      expect(result.price).toBe(999.99);
      expect(result.stock).toBe(50);
      expect(result.categoryId).toBe(testCategory.id);
      expect(result.createdAt).toBeValidDate();
      expect(result.updatedAt).toBeValidDate();
      expect(result.createdAt).toEqual(result.updatedAt);
    });

    it('should generate unique IDs for different products', () => {
      // Arrange
      const product1Data = createTestProduct(testCategory.id, { name: 'Product 1' });
      const product2Data = createTestProduct(testCategory.id, { name: 'Product 2' });

      // Act
      const product1 = productStore.create(product1Data);
      const product2 = productStore.create(product2Data);

      // Assert
      expect(product1.id).not.toBe(product2.id);
    });

    it('should preserve all input data exactly', () => {
      // Arrange
      const productData = createTestProduct(testCategory.id, {
        name: 'Test Product',
        description: 'Test Description',
        price: 123.45,
        stock: 25
      });

      // Act
      const result = productStore.create(productData);

      // Assert
      expect(result.name).toBe(productData.name);
      expect(result.description).toBe(productData.description);
      expect(result.price).toBe(productData.price);
      expect(result.stock).toBe(productData.stock);
      expect(result.categoryId).toBe(productData.categoryId);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no products exist', () => {
      // Act
      const result = productStore.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all created products', () => {
      // Arrange
      const product1 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 1' }));
      const product2 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 2' }));

      // Act
      const result = productStore.getAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(product1);
      expect(result).toContainEqual(product2);
    });
  });

  describe('getById', () => {
    it('should return product when it exists', () => {
      // Arrange
      const product = productStore.create(createTestProduct(testCategory.id));

      // Act
      const result = productStore.getById(product.id);

      // Assert
      expect(result).toEqual(product);
    });

    it('should return undefined when product does not exist', () => {
      // Act
      const result = productStore.getById('nonexistent-id');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getByCategoryId', () => {
    it('should return products belonging to specific category', () => {
      // Arrange
      const category2 = categoryStore.create(createTestCategory({ name: 'Category 2' }));
      
      const product1 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 1' }));
      const product2 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 2' }));
      const product3 = productStore.create(createTestProduct(category2.id, { name: 'Product 3' }));

      // Act
      const result = productStore.getByCategoryId(testCategory.id);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(product1);
      expect(result).toContainEqual(product2);
      expect(result).not.toContainEqual(product3);
    });

    it('should return empty array when no products in category', () => {
      // Act
      const result = productStore.getByCategoryId(testCategory.id);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for nonexistent category', () => {
      // Act
      const result = productStore.getByCategoryId('nonexistent-category-id');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('exists', () => {
    it('should return true when product exists', () => {
      // Arrange
      const product = productStore.create(createTestProduct(testCategory.id));

      // Act
      const result = productStore.exists(product.id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product does not exist', () => {
      // Act
      const result = productStore.exists('nonexistent-id');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update product with new data', async () => {
      // Arrange
      const originalProduct = productStore.create(createTestProduct(testCategory.id, {
        name: 'Original Product',
        description: 'Original Description',
        price: 100,
        stock: 10
      }));

      const updateData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 200,
        stock: 20
      };

      // Add a small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      // Act
      const result = productStore.update(originalProduct.id, updateData);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(originalProduct.id);
      expect(result!.name).toBe('Updated Product');
      expect(result!.description).toBe('Updated Description');
      expect(result!.price).toBe(200);
      expect(result!.stock).toBe(20);
      expect(result!.categoryId).toBe(originalProduct.categoryId); // Should remain unchanged
      expect(result!.createdAt).toEqual(originalProduct.createdAt);
      expect(result!.updatedAt.getTime()).toBeGreaterThan(originalProduct.updatedAt.getTime());
    });

    it('should update only provided fields', () => {
      // Arrange
      const originalProduct = productStore.create(createTestProduct(testCategory.id, {
        name: 'Original Product',
        price: 100,
        stock: 10
      }));

      // Act - Update only price
      const result = productStore.update(originalProduct.id, { price: 150 });

      // Assert
      expect(result!.price).toBe(150);
      expect(result!.name).toBe('Original Product'); // Should remain unchanged
      expect(result!.stock).toBe(10); // Should remain unchanged
    });

    it('should allow category change', () => {
      // Arrange
      const category2 = categoryStore.create(createTestCategory({ name: 'New Category' }));
      const product = productStore.create(createTestProduct(testCategory.id));

      // Act
      const result = productStore.update(product.id, { categoryId: category2.id });

      // Assert
      expect(result!.categoryId).toBe(category2.id);
    });

    it('should return null when product does not exist', () => {
      // Act
      const result = productStore.update('nonexistent-id', { name: 'New Name' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete product successfully', () => {
      // Arrange
      const product = productStore.create(createTestProduct(testCategory.id));

      // Act
      const result = productStore.delete(product.id);

      // Assert
      expect(result).toBe(true);
      expect(productStore.getById(product.id)).toBeUndefined();
    });

    it('should return false when product does not exist', () => {
      // Act
      const result = productStore.delete('nonexistent-id');

      // Assert
      expect(result).toBe(false);
    });

    it('should remove product from category product list', () => {
      // Arrange
      const product1 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 1' }));
      const product2 = productStore.create(createTestProduct(testCategory.id, { name: 'Product 2' }));

      // Act
      productStore.delete(product1.id);

      // Assert
      const categoryProducts = productStore.getByCategoryId(testCategory.id);
      expect(categoryProducts).toHaveLength(1);
      expect(categoryProducts).toContainEqual(product2);
      expect(categoryProducts).not.toContainEqual(product1);
    });
  });
}); 