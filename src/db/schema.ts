import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table - Platform users
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  timeOfBirth: text('time_of_birth'),
  placeOfBirth: text('place_of_birth'),
  subscriptionPlan: text('subscription_plan').notNull().default('free'),
  subscriptionExpiry: text('subscription_expiry'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Astrologers table - Consultants on the platform
export const astrologers = sqliteTable('astrologers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull(),
  specializations: text('specializations', { mode: 'json' }).notNull(),
  experience: integer('experience').notNull(),
  rating: real('rating').default(0.0),
  totalConsultations: integer('total_consultations').default(0),
  hourlyRate: integer('hourly_rate').notNull(),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  bio: text('bio'),
  photo: text('photo'),
  isOnline: integer('is_online', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Bookings table - Consultation bookings
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  astrologerId: integer('astrologer_id').references(() => astrologers.id),
  bookingType: text('booking_type').notNull(),
  serviceType: text('service_type').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  duration: integer('duration').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Subscriptions table - User subscription records
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  plan: text('plan').notNull(),
  amount: integer('amount').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  razorpayOrderId: text('razorpay_order_id').notNull(),
  razorpayPaymentId: text('razorpay_payment_id'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});

// Chat Sessions table - AI and astrologer chat sessions
export const chatSessions = sqliteTable('chat_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  astrologerId: integer('astrologer_id').references(() => astrologers.id),
  sessionType: text('session_type').notNull(),
  messages: text('messages', { mode: 'json' }).notNull(),
  status: text('status').notNull().default('active'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  createdAt: text('created_at').notNull(),
});

// Payments table - Payment records
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  razorpayOrderId: text('razorpay_order_id').notNull(),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});

// Add pandits table at the end
export const pandits = sqliteTable('pandits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  specialization: text('specialization').notNull(),
  experience: integer('experience').notNull(),
  languages: text('languages').notNull(),
  rating: real('rating').default(4.5),
  pricePerHour: integer('price_per_hour').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  available: integer('available', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});