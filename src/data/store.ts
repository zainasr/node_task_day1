// src/data/store.ts

import { Category, Product } from '../types';
import { randomUUID } from 'crypto';

// In-memory storage
const categories: Map<string, Category> = new Map();
const products: Map<string, Product> = new Map();

// Category operations
export const categoryStore = {
  getAll: (): Category[] => Array.from(categories.values()),

  getById: (id: string): Category | undefined => categories.get(id),

  create: (data: { name: string; description: string }): Category => {
    const category: Category = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    categories.set(category.id, category);
    return category;
  },

  update: (
    id: string,
    data: { name?: string; description?: string }
  ): Category | null => {
    const category = categories.get(id);
    if (!category) return null;

    const updatedCategory: Category = {
      ...category,
      ...data,
      updatedAt: new Date(),
    };
    categories.set(id, updatedCategory);
    return updatedCategory;
  },

  delete: (id: string): boolean => {
    // Check if category has products
    const hasProducts = Array.from(products.values()).some(
      (product) => product.categoryId === id
    );
    if (hasProducts) return false;

    return categories.delete(id);
  },

  exists: (id: string): boolean => categories.has(id),

  // For testing purposes only
  clear: (): void => {
    categories.clear();
  },
};

// Product operations
export const productStore = {
  getAll: (): Product[] => Array.from(products.values()),

  getById: (id: string): Product | undefined => products.get(id),

  getByCategoryId: (categoryId: string): Product[] =>
    Array.from(products.values()).filter(
      (product) => product.categoryId === categoryId
    ),

  create: (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
  }): Product => {
    const product: Product = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.set(product.id, product);
    return product;
  },

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
    }
  ): Product | null => {
    const product = products.get(id);
    if (!product) return null;

    const updatedProduct: Product = {
      ...product,
      ...data,
      updatedAt: new Date(),
    };
    products.set(id, updatedProduct);
    return updatedProduct;
  },

  delete: (id: string): boolean => products.delete(id),

  exists: (id: string): boolean => products.has(id),

  // For testing purposes only
  clear: (): void => {
    products.clear();
  },
}; 