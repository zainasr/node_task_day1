// tests/integration/routes/products.integration.test.ts

import request from 'supertest';
import { Application } from 'express';
import createApp from '../../../src/app';
import { categoryStore, productStore } from '../../../src/data/store';

describe('Products Integration Tests', () => {
  let app: Application;
  let testCategory: any;

  beforeEach(() => {
    app = createApp();
    
    // Clear stores before each test
    (categoryStore as any).clear();
    (productStore as any).clear();

    // Create a test category for products
    testCategory = categoryStore.create({
      name: 'Electronics',
      description: 'Electronic devices',
    });
  });

  describe('GET /api/products', () => {
    it('should return empty array when no products exist', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Products retrieved successfully',
        data: [],
      });
    });

    it('should return all products', async () => {
      const product1 = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const product2 = productStore.create({
        name: 'MacBook Pro',
        description: 'Professional laptop',
        price: 1999.99,
        stock: 20,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toContainEqual(product1);
      expect(response.body.data).toContainEqual(product2);
    });
  });

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const productData = {
        name: 'iPhone 15',
        description: 'Latest smartphone with advanced features',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data).toMatchObject({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        categoryId: productData.categoryId,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 for nonexistent category', async () => {
      const productData = {
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: '550e8400-e29b-41d4-a716-446655440000', // Nonexistent
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'iPhone 15',
          // Missing description, price, stock, categoryId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for invalid price', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'iPhone 15',
          description: 'Latest smartphone',
          price: -100, // Invalid negative price
          stock: 50,
          categoryId: testCategory.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for invalid stock', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'iPhone 15',
          description: 'Latest smartphone',
          price: 999.99,
          stock: -10, // Invalid negative stock
          categoryId: testCategory.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid categoryId format', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'iPhone 15',
          description: 'Latest smartphone',
          price: 999.99,
          stock: 50,
          categoryId: 'invalid-uuid-format',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product when it exists', async () => {
      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(product);
    });

    it('should return 404 when product does not exist', async () => {
      const response = await request(app)
        .get('/api/products/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully', async () => {
      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const updateData = {
        name: 'iPhone 15 Pro',
        price: 1099.99,
        stock: 30,
      };

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.stock).toBe(updateData.stock);
      expect(response.body.data.description).toBe('Latest smartphone'); // Unchanged
      expect(response.body.data.id).toBe(product.id);
    });

    it('should update category successfully', async () => {
      const newCategory = categoryStore.create({
        name: 'Smartphones',
        description: 'Mobile devices',
      });

      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .send({ categoryId: newCategory.id })
        .expect(200);

      expect(response.body.data.categoryId).toBe(newCategory.id);
    });

    it('should return 400 for invalid category in update', async () => {
      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .send({ categoryId: '550e8400-e29b-41d4-a716-446655440000' }) // Nonexistent
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });

    it('should return 400 for empty update data', async () => {
      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No update data provided');
    });

    it('should return 404 for nonexistent product', async () => {
      const response = await request(app)
        .put('/api/products/550e8400-e29b-41d4-a716-446655440000')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product successfully', async () => {
      const product = productStore.create({
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: 999.99,
        stock: 50,
        categoryId: testCategory.id,
      });

      const response = await request(app)
        .delete(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');

      // Verify product is deleted
      await request(app)
        .get(`/api/products/${product.id}`)
        .expect(404);
    });

    it('should return 404 for nonexistent product', async () => {
      const response = await request(app)
        .delete('/api/products/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('Product-Category Relationship Integration', () => {
    it('should complete full product workflow', async () => {
      // 1. Create category
      const categoryResponse = await request(app)
        .post('/api/categories')
        .send({
          name: 'Smartphones',
          description: 'Mobile devices',
        })
        .expect(201);

      const categoryId = categoryResponse.body.data.id;

      // 2. Create product in category
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'iPhone 15',
          description: 'Latest smartphone',
          price: 999.99,
          stock: 50,
          categoryId: categoryId,
        })
        .expect(201);

      const productId = productResponse.body.data.id;

      // 3. Verify product appears in category products
      const categoryProductsResponse = await request(app)
        .get(`/api/categories/${categoryId}/products`)
        .expect(200);

      expect(categoryProductsResponse.body.data).toHaveLength(1);
      expect(categoryProductsResponse.body.data[0].id).toBe(productId);

      // 4. Try to delete category (should fail)
      await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(400);

      // 5. Delete product first
      await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);

      // 6. Verify product removed from category
      const emptyProductsResponse = await request(app)
        .get(`/api/categories/${categoryId}/products`)
        .expect(200);

      expect(emptyProductsResponse.body.data).toHaveLength(0);

      // 7. Now category can be deleted
      await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(200);
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle very large price values', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Expensive Product',
          description: 'Very expensive item',
          price: 1000000, // Above max allowed
          stock: 1,
          categoryId: testCategory.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle decimal stock values', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'Test description',
          price: 99.99,
          stock: 10.5, // Should be integer
          categoryId: testCategory.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle very long product names', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'A'.repeat(101), // Too long
          description: 'Test description',
          price: 99.99,
          stock: 10,
          categoryId: testCategory.id,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
}); 