// src/db/schema/products.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer, // Changed from decimal to integer
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { categories } from './categories';

/**
 * Products table schema
 * Represents products in the system with a foreign key to categories
 */
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(), // ✅ CHANGED: Now integer instead of decimal
    stock: integer('stock').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Add indices for better query performance
    categoryIdIdx: index('idx_products_category_id').on(table.categoryId),
    nameIdx: index('idx_products_name').on(table.name),
    priceIdx: index('idx_products_price').on(table.price),
  })
);

// Entity types derived from the schema (DB layer)
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;
