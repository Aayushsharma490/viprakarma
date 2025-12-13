import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig: Config = defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './viprakarma.db',
  },
});

export default dbConfig;
