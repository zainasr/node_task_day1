// src/db/reset.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { env } from '../config/env';
import { products } from './schema/products';
import { categories } from './schema/categories';
import { users } from './schema/users';

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
  max: env.POSTGRES_POOL_MAX,
  idleTimeoutMillis: env.POSTGRES_POOL_IDLE_TIMEOUT,
});

const db = drizzle(pool);

async function resetDatabase() {
  try {
    console.log('🗄️  Starting database reset...');

    // Delete all data from tables (order matters due to foreign keys)
    console.log('🧹 Deleting all products...');
    await db.delete(products);

    console.log('🧹 Deleting all categories...');
    await db.delete(categories);

    console.log('🧹 Deleting all users...');
    await db.delete(users);

    console.log('✅ Database reset completed successfully!');
    console.log('📊 All tables are now empty');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

async function resetDatabaseWithTruncate() {
  try {
    console.log('🗄️  Starting database reset with TRUNCATE...');

    // TRUNCATE is faster and resets auto-increment counters
    // Order matters due to foreign key constraints
    await db.execute(sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE`);
    console.log('🧹 Products table truncated');

    await db.execute(sql`TRUNCATE TABLE categories RESTART IDENTITY CASCADE`);
    console.log('🧹 Categories table truncated');

    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
    console.log('🧹 Users table truncated');

    console.log('✅ Database reset with TRUNCATE completed successfully!');
    console.log('📊 All tables are now empty and counters reset');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

async function dropAllTables() {
  try {
    console.log('🗄️  Starting complete database wipe...');
    console.log('⚠️  This will DROP all tables and data!');

    // Drop tables in reverse order (foreign key dependencies)
    await db.execute(sql`DROP TABLE IF EXISTS products CASCADE`);
    console.log('💥 Products table dropped');

    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
    console.log('💥 Categories table dropped');

    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    console.log('💥 Users table dropped');

    // Drop the migrations table if it exists
    await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
    console.log('💥 Migrations table dropped');

    console.log('✅ Complete database wipe completed!');
    console.log('📊 All tables have been dropped');
    console.log('🔄 You will need to run migrations again');
  } catch (error) {
    console.error('❌ Database wipe failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Command line argument handling
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'data':
      await resetDatabase();
      break;
    case 'truncate':
      await resetDatabaseWithTruncate();
      break;
    case 'drop':
      await dropAllTables();
      break;
    default:
      console.log('📖 Usage:');
      console.log(
        '  npm run db:reset:data     - Delete all data (keeps tables)'
      );
      console.log('  npm run db:reset:truncate - TRUNCATE all tables (faster)');
      console.log(
        '  npm run db:reset:drop     - DROP all tables (complete wipe)'
      );
      process.exit(1);
  }
}

main();
