// src/config/env.ts
import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),

  // Database
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('5432'),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Database Pool
  POSTGRES_POOL_MIN: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('0'),
  POSTGRES_POOL_MAX: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('10'),
  POSTGRES_POOL_IDLE_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('10000'),

  // Database URL (for migrations)
  DATABASE_URL: z.string().url(),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3000/api/auth/google/callback'),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRATION: z.string().default('1h'), // 1 hour by default

  // Frontend URL for redirects (prod usage)
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(
          (issue) =>
            issue.code === 'invalid_type' && issue.received === 'undefined'
        )
        .map((issue) => issue.path.join('.'));

      throw new Error(
        `❌ Missing required environment variables:\n${missingVars.join('\n')}\n` +
          `Please check your .env file and make sure all required variables are set.`
      );
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Export type for TypeScript
export type Env = z.infer<typeof envSchema>;
