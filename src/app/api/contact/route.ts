import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { createClient } from '@libsql/client';


// Force Node.js runtime for Vercel compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Ensure contact_queries table exists
async function ensureContactQueriesTable() {
    try {
        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
            authToken: process.env.TURSO_AUTH_TOKEN || '',
        });

        await client.execute(`
      CREATE TABLE IF NOT EXISTS "contact_queries" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "subject" text NOT NULL,
        "message" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "admin_response" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      );
    `);
    } catch (e) {
        console.error('Failed to ensure contact_queries table:', e);
    }
}

export async function POST(request: NextRequest) {
    try {
        await ensureContactQueriesTable();

        const { name, email, phone, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date().toISOString();

        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
            authToken: process.env.TURSO_AUTH_TOKEN || '',
        });

        await client.execute({
            sql: `INSERT INTO contact_queries (name, email, phone, subject, message, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
            args: [name, email, phone || null, subject, message, now, now]
        });

        return NextResponse.json({
            success: true,
            message: 'Query submitted successfully'
        });

    } catch (error) {
        console.error('Contact query submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await ensureContactQueriesTable();

        const client = createClient({
            url: process.env.TURSO_CONNECTION_URL || 'file:./local.db',
            authToken: process.env.TURSO_AUTH_TOKEN || '',
        });

        const result = await client.execute('SELECT * FROM contact_queries ORDER BY created_at DESC LIMIT 100');

        return NextResponse.json({
            success: true,
            queries: result.rows
        });

    } catch (error) {
        console.error('Get contact queries error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
