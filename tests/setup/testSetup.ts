// tests/setup/testSetup.ts

import { categoryStore, productStore } from '../../src/data/store';

// Global test setup
beforeEach(() => {
  // Clear all data before each test to ensure test isolation
  (categoryStore as any).clear();
  (productStore as any).clear();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidDate(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Date`,
        pass: false,
      };
    }
  },
});

// Test data factories
export const createTestCategory = (overrides: Partial<any> = {}) => ({
  name: 'Test Category',
  description: 'Test Description',
  ...overrides,
});

export const createTestProduct = (categoryId: string, overrides: Partial<any> = {}) => ({
  name: 'Test Product',
  description: 'Test Product Description',
  price: 99.99,
  stock: 10,
  categoryId,
  ...overrides,
});

// Mock data
export const mockCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Electronics',
  description: 'Electronic devices and accessories',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockProduct = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'iPhone 15',
  description: 'Latest iPhone model',
  price: 999.99,
  stock: 50,
  categoryId: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}; 