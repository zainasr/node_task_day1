// src/db/seed.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';
import { categories, products } from './schema';
import logger from '../utils/logger';

/**
 * Database seeding utility
 * Populates database with test data for development/testing
 */

const pool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});

const db = drizzle(pool);

// Seed data for categories
const categorySeedData = [
  {
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets',
  },
  {
    name: 'Clothing',
    description: 'Fashion apparel and accessories',
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
  },
  {
    name: 'Books & Media',
    description: 'Books, movies, and digital media',
  },
  {
    name: 'Health & Beauty',
    description: 'Health products and beauty supplies',
  },
  {
    name: 'Toys & Games',
    description: 'Toys, games, and entertainment',
  },
  {
    name: 'Automotive',
    description: 'Car parts and automotive accessories',
  },
  {
    name: 'Food & Beverages',
    description: 'Food items and beverages',
  },
  {
    name: 'Jewelry & Watches',
    description: 'Fine jewelry and luxury watches',
  },
];

// Helper function to create different timestamps
const createTimestamp = (minutesOffset: number): Date => {
  const baseTime = new Date('2024-01-15T10:00:00Z');
  baseTime.setMinutes(baseTime.getMinutes() + minutesOffset);
  return baseTime;
};

// Seed data for products (with realistic data and different timestamps)
const productSeedData = [
  // Electronics Category (newest first)
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced camera system and A17 Pro chip',
    price: 999,
    stock: 50,
    categoryName: 'Electronics',
    createdAt: createTimestamp(0), // 10:00 AM
  },
  {
    name: 'MacBook Air M2',
    description: 'Ultra-thin laptop with M2 chip and all-day battery life',
    price: 1199,
    stock: 30,
    categoryName: 'Electronics',
    createdAt: createTimestamp(1), // 10:01 AM
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'Android flagship with AI features and excellent camera',
    price: 899,
    stock: 45,
    categoryName: 'Electronics',
    createdAt: createTimestamp(2), // 10:02 AM
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-canceling headphones with 30-hour battery',
    price: 349,
    stock: 75,
    categoryName: 'Electronics',
    createdAt: createTimestamp(3), // 10:03 AM
  },
  {
    name: 'iPad Air',
    description: 'Versatile tablet perfect for work and entertainment',
    price: 599,
    stock: 40,
    categoryName: 'Electronics',
    createdAt: createTimestamp(4), // 10:04 AM
  },

  // Clothing Category
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max technology',
    price: 150,
    stock: 100,
    categoryName: 'Clothing',
    createdAt: createTimestamp(5), // 10:05 AM
  },
  {
    name: "Levi's 501 Jeans",
    description: 'Classic straight-fit jeans in various washes',
    price: 89,
    stock: 200,
    categoryName: 'Clothing',
    createdAt: createTimestamp(6), // 10:06 AM
  },
  {
    name: 'Adidas Ultraboost',
    description: 'Premium running shoes with responsive cushioning',
    price: 180,
    stock: 60,
    categoryName: 'Clothing',
    createdAt: createTimestamp(7), // 10:07 AM
  },
  {
    name: 'Uniqlo Heattech T-Shirt',
    description: 'Thermal t-shirt perfect for cold weather',
    price: 25,
    stock: 150,
    categoryName: 'Clothing',
    createdAt: createTimestamp(8), // 10:08 AM
  },

  // Home & Garden Category
  {
    name: 'Philips Hue Smart Bulb',
    description: 'Smart LED bulb with 16 million colors and voice control',
    price: 49,
    stock: 80,
    categoryName: 'Home & Garden',
    createdAt: createTimestamp(9), // 10:09 AM
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Cordless vacuum with laser dust detection',
    price: 699,
    stock: 25,
    categoryName: 'Home & Garden',
    createdAt: createTimestamp(10), // 10:10 AM
  },
  {
    name: 'IKEA Billy Bookcase',
    description: 'Versatile bookcase perfect for any room',
    price: 79,
    stock: 120,
    categoryName: 'Home & Garden',
    createdAt: createTimestamp(11), // 10:11 AM
  },
  {
    name: 'Gardena Garden Hose',
    description: '50ft expandable garden hose with spray nozzle',
    price: 35,
    stock: 90,
    categoryName: 'Home & Garden',
    createdAt: createTimestamp(12), // 10:12 AM
  },

  // Sports & Outdoors Category
  {
    name: 'Yeti Tundra 45 Cooler',
    description: 'Premium cooler with superior ice retention',
    price: 299,
    stock: 40,
    categoryName: 'Sports & Outdoors',
    createdAt: createTimestamp(13), // 10:13 AM
  },
  {
    name: 'Nike Basketball',
    description: 'Official size and weight basketball for indoor/outdoor use',
    price: 45,
    stock: 80,
    categoryName: 'Sports & Outdoors',
    createdAt: createTimestamp(14), // 10:14 AM
  },
  {
    name: 'Coleman 4-Person Tent',
    description: 'Weather-resistant tent perfect for camping trips',
    price: 129,
    stock: 35,
    categoryName: 'Sports & Outdoors',
    createdAt: createTimestamp(15), // 10:15 AM
  },
  {
    name: 'Fitbit Charge 6',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 159,
    stock: 65,
    categoryName: 'Sports & Outdoors',
    createdAt: createTimestamp(16), // 10:16 AM
  },

  // Books & Media Category
  {
    name: 'Kindle Paperwhite',
    description: 'Waterproof e-reader with adjustable backlight',
    price: 139,
    stock: 70,
    categoryName: 'Books & Media',
    createdAt: createTimestamp(17), // 10:17 AM
  },
  {
    name: 'Sony WH-1000XM4',
    description: 'Previous generation noise-canceling headphones',
    price: 279,
    stock: 45,
    categoryName: 'Books & Media',
    createdAt: createTimestamp(18), // 10:18 AM
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with 20-hour battery',
    price: 89,
    stock: 95,
    categoryName: 'Books & Media',
    createdAt: createTimestamp(19), // 10:19 AM
  },

  // Health & Beauty Category
  {
    name: 'Oral-B Electric Toothbrush',
    description: 'Smart electric toothbrush with app connectivity',
    price: 129,
    stock: 110,
    categoryName: 'Health & Beauty',
    createdAt: createTimestamp(20), // 10:20 AM
  },
  {
    name: 'Dove Body Wash',
    description: 'Moisturizing body wash for all skin types',
    price: 8,
    stock: 200,
    categoryName: 'Health & Beauty',
    createdAt: createTimestamp(21), // 10:21 AM
  },
  {
    name: 'Vitamins Daily Pack',
    description: 'Complete daily vitamin and mineral supplement',
    price: 45,
    stock: 85,
    categoryName: 'Health & Beauty',
    createdAt: createTimestamp(22), // 10:22 AM
  },

  // Toys & Games Category
  {
    name: 'LEGO Star Wars Set',
    description: "Collector's edition Star Wars LEGO set",
    price: 79,
    stock: 60,
    categoryName: 'Toys & Games',
    createdAt: createTimestamp(23), // 10:23 AM
  },
  {
    name: 'Nintendo Switch',
    description: 'Hybrid gaming console for home and portable play',
    price: 299,
    stock: 30,
    categoryName: 'Toys & Games',
    createdAt: createTimestamp(24), // 10:24 AM
  },
  {
    name: 'Board Game Collection',
    description: 'Family board game collection with 5 popular games',
    price: 65,
    stock: 40,
    categoryName: 'Toys & Games',
    createdAt: createTimestamp(25), // 10:25 AM
  },

  // Automotive Category
  {
    name: 'Dash Cam',
    description: 'HD dash camera with night vision and GPS',
    price: 89,
    stock: 75,
    categoryName: 'Automotive',
    createdAt: createTimestamp(26), // 10:26 AM
  },
  {
    name: 'Car Phone Mount',
    description: 'Universal phone mount for car dashboard',
    price: 25,
    stock: 120,
    categoryName: 'Automotive',
    createdAt: createTimestamp(27), // 10:27 AM
  },
  {
    name: 'Jump Starter',
    description: 'Portable car battery jump starter with USB ports',
    price: 69,
    stock: 50,
    categoryName: 'Automotive',
    createdAt: createTimestamp(28), // 10:28 AM
  },

  // Food & Beverages Category
  {
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans, 1lb bag',
    price: 18,
    stock: 150,
    categoryName: 'Food & Beverages',
    createdAt: createTimestamp(29), // 10:29 AM
  },
  {
    name: 'Protein Powder',
    description: 'Whey protein powder, chocolate flavor, 2lb container',
    price: 45,
    stock: 80,
    categoryName: 'Food & Beverages',
    createdAt: createTimestamp(30), // 10:30 AM
  },
  {
    name: 'Energy Bars Pack',
    description: 'Pack of 12 high-protein energy bars',
    price: 22,
    stock: 100,
    categoryName: 'Food & Beverages',
    createdAt: createTimestamp(31), // 10:31 AM
  },

  // Jewelry & Watches Category
  {
    name: 'Apple Watch Series 9',
    description: 'Latest Apple Watch with health monitoring features',
    price: 399,
    stock: 35,
    categoryName: 'Jewelry & Watches',
    createdAt: createTimestamp(32), // 10:32 AM
  },
  {
    name: 'Diamond Stud Earrings',
    description: '14k white gold diamond stud earrings, 1/4 carat',
    price: 899,
    stock: 15,
    categoryName: 'Jewelry & Watches',
    createdAt: createTimestamp(33), // 10:33 AM
  },
  {
    name: 'Leather Watch Band',
    description: 'Genuine leather watch band, adjustable size',
    price: 45,
    stock: 90,
    categoryName: 'Jewelry & Watches',
    createdAt: createTimestamp(34), // 10:34 AM
  },
];

/**
 * Seed the database with test data
 */
export async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    logger.info('Clearing existing data...');
    await db.delete(products);
    await db.delete(categories);

    // Insert categories
    logger.info('Inserting categories...');
    const insertedCategories = await db
      .insert(categories)
      .values(categorySeedData)
      .returning();

    logger.info(`Inserted ${insertedCategories.length} categories`);

    // Create category name to ID mapping
    const categoryMap = new Map(
      insertedCategories.map((cat) => [cat.name, cat.id])
    );

    // Prepare products data with category IDs and timestamps
    const productsWithCategoryIds = productSeedData.map((product) => {
      const categoryId = categoryMap.get(product.categoryName);
      if (!categoryId) {
        throw new Error(`Category not found: ${product.categoryName}`);
      }

      return {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: categoryId,
        createdAt: product.createdAt, // Use the custom timestamp
        updatedAt: product.createdAt, // Same as createdAt for consistency
      };
    });

    // Insert products
    logger.info('Inserting products...');
    const insertedProducts = await db
      .insert(products)
      .values(productsWithCategoryIds)
      .returning();

    logger.info(`Inserted ${insertedProducts.length} products`);

    // Log summary
    logger.info('Database seeding completed successfully!');
    logger.info(`Total categories: ${insertedCategories.length}`);
    logger.info(`Total products: ${insertedProducts.length}`);

    // Log some sample data for verification
    logger.info(
      'Sample categories:',
      insertedCategories.slice(0, 3).map((c) => c.name)
    );
    logger.info(
      'Sample products:',
      insertedProducts.slice(0, 3).map((p) => p.name)
    );
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Run the seed function if this file is executed directly
 */
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
