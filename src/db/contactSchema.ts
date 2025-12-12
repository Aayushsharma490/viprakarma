import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const contactQueries = sqliteTable('contact_queries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status').notNull().default('pending'), // pending, responded, closed
    adminResponse: text('admin_response'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});
