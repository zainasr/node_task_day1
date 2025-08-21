// src/config/database.config.ts
import { z } from 'zod';
import { env } from './env';

const databaseSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
  ssl: z.boolean(),
  pool: z.object({
    min: z.number(),
    max: z.number(),
    idleTimeoutMillis: z.number(),
  }),
});

export type DatabaseConfig = z.infer<typeof databaseSchema>;

export const databaseConfig: DatabaseConfig = {
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  ssl: env.POSTGRES_SSL,
  pool: {
    min: env.POSTGRES_POOL_MIN,
    max: env.POSTGRES_POOL_MAX,
    idleTimeoutMillis: env.POSTGRES_POOL_IDLE_TIMEOUT,
  },
};