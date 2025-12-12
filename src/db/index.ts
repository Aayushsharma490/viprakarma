import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

// Use DATABASE_URL from environment or default to viprakarma.db
export const client = createClient({
  url: process.env.DATABASE_URL || 'file:./viprakarma.db',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
