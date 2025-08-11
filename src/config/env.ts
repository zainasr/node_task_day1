// src/config/env.ts

import { cleanEnv, port, str } from 'envalid';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
});

// Now env.PORT is guaranteed to be a number
// and env.NODE_ENV is guaranteed to be a string with specific values 