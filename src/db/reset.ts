// src/db/reset.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
// import { sql } from 'drizzle-orm';
import { env } from '../config/env';
import { products } from './schema/products';
import { categories } from './schema/categories';
import { users } from './schema/users';
import logger from '../utils/logger';

/**
 * Database reset script
 * WARNING: This will delete ALL data in the database
 */

const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

const db = drizzle(pool);

export async function resetDatabase(): Promise<void> {
  try {
    logger.info('Starting database reset...');

    // Delete all data from tables (in correct order due to foreign keys)
    logger.info('Deleting all data...');

    await db.delete(products);
    logger.info('Products table cleared');

    await db.delete(categories);
    logger.info('Categories table cleared');

    await db.delete(users);
    logger.info('Users table cleared');

    logger.info('Database reset completed successfully!');
  } catch (error) {
    logger.error('Database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Run the reset function if this file is executed directly
 */
if (require.main === module) {
  resetDatabase()
    .then(() => {
      logger.info('Reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Reset failed:', error);
      process.exit(1);
    });
}
