// tests/integration/routes/categories.integration.test.ts

import request from 'supertest';
import { Application } from 'express';
import createApp from '../../../src/app';
import { categoryStore, productStore } from '../../../src/data/store';

describe('Categories Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createApp();
    
    // Clear stores before each test
    (categoryStore as any).clear();
    (productStore as any).clear();
  });

  describe('GET /api/categories', () => {
    it('should return empty array when no categories exist', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Categories retrieved successfully',
        data: [],
      });
    });

    it('should return all categories', async () => {
      // Create test categories
      const category1 = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });
      const category2 = categoryStore.create({
        name: 'Clothing',
        description: 'Apparel and accessories',
      });

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toContainEqual(category1);
      expect(response.body.data).toContainEqual(category2);
    });
  });

  describe('POST /api/categories', () => {
    it('should create category with valid data', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category created successfully');
      expect(response.body.data).toMatchObject({
        name: categoryData.name,
        description: categoryData.description,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          description: 'Electronic devices',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: '',
          description: 'Electronic devices',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'Electronics',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for name too long', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'A'.repeat(101), // 101 characters
          description: 'Test description',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return category when it exists', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const response = await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(category);
    });

    it('should return 404 when category does not exist', async () => {
      const response = await request(app)
        .get('/api/categories/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/categories/:id/products', () => {
    it('should return products for existing category', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const product1 = productStore.create({
        name: 'iPhone',
        description: 'Smartphone',
        price: 999,
        stock: 10,
        categoryId: category.id,
      });

      const product2 = productStore.create({
        name: 'iPad',
        description: 'Tablet',
        price: 599,
        stock: 15,
        categoryId: category.id,
      });

      const response = await request(app)
        .get(`/api/categories/${category.id}/products`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toContainEqual(product1);
      expect(response.body.data).toContainEqual(product2);
    });

    it('should return empty array for category with no products', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const response = await request(app)
        .get(`/api/categories/${category.id}/products`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 404 when category does not exist', async () => {
      const response = await request(app)
        .get('/api/categories/550e8400-e29b-41d4-a716-446655440000/products')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category successfully', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const updateData = {
        name: 'Updated Electronics',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.id).toBe(category.id);
    });

    it('should update only provided fields', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .send({ name: 'Updated Electronics' })
        .expect(200);

      expect(response.body.data.name).toBe('Updated Electronics');
      expect(response.body.data.description).toBe('Electronic devices'); // Unchanged
    });

    it('should return 400 for empty update data', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No update data provided');
    });

    it('should return 404 for nonexistent category', async () => {
      const response = await request(app)
        .put('/api/categories/550e8400-e29b-41d4-a716-446655440000')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category without products', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      const response = await request(app)
        .delete(`/api/categories/${category.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Category deleted successfully');

      // Verify category is deleted
      await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(404);
    });

    it('should not delete category with products', async () => {
      const category = categoryStore.create({
        name: 'Electronics',
        description: 'Electronic devices',
      });

      productStore.create({
        name: 'iPhone',
        description: 'Smartphone',
        price: 999,
        stock: 10,
        categoryId: category.id,
      });

      const response = await request(app)
        .delete(`/api/categories/${category.id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete category with existing products');

      // Verify category still exists
      await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(200);
    });

    it('should return 404 for nonexistent category', async () => {
      const response = await request(app)
        .delete('/api/categories/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-route/test')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
}); 