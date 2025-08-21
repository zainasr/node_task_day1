// src/db/schema/relations.ts
import { relations } from 'drizzle-orm';
import { categories } from './categories';
import { products } from './products';
import { users } from './users';

/**
 * Define type-safe relationships between tables
 */

// Categories to Products (one-to-many)
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// Products to Categories (many-to-one)
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

// Users relations can be extended later if needed
export const usersRelations = relations(users, ({}) => ({}));
