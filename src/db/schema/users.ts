// src/db/schema/users.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Users table schema
 * Stores user information for authentication and authorization
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    picture: text('picture'),
    provider: varchar('provider', { length: 50 }).notNull(), // 'google', 'github', etc.
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('user'), // 'user', 'admin'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    providerIdIdx: index('idx_users_provider_id').on(table.providerId),
  })
);

// Type definitions derived from the schema
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type CreateUserInput = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;
