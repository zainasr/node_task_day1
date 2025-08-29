// src/db/schema/orders.ts
import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  type: varchar('type', { length: 20 }).notNull(), // 'one_time' | 'subscription'
  status: varchar('status', { length: 20 }).notNull(), // 'created' | 'paid' | 'failed' | 'refunded' | 'canceled'
  currency: varchar('currency', { length: 10 }).notNull().default('usd'),
  actual_amount: integer('actual_amount').notNull(),
  amount_in_cents: integer('amount_in_cents'),
  stripeCheckoutSessionId: varchar('stripe_checkout_session_id', {
    length: 255,
  }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', {
    length: 255,
  }).notNull(),
  status: varchar('status', { length: 30 }).notNull(), // 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'refunded'
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  rawEventId: varchar('raw_event_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
