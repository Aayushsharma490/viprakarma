import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Notifications table - User notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // info, success, warning, error
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  link: text('link'),
  createdAt: text('created_at').notNull(),
});

// Update users table to include active consultation astrologer
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
  isMahuratSubscribed: integer('is_mahurat_subscribed', { mode: 'boolean' }).default(false),
  mahuratSubscriptionExpiry: text('mahurat_subscription_expiry'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  canChatWithAstrologer: integer('can_chat_with_astrologer', { mode: 'boolean' }).notNull().default(false),
  activeConsultationAstrologerId: integer('active_consultation_astrologer_id').references(() => astrologers.id),
  resetToken: text('reset_token'),
  resetTokenExpiry: text('reset_token_expiry'),
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
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  bio: text('bio'),
  photo: text('photo'),
  languages: text('languages'),
  location: text('location'),
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

// Chat Messages table - Individual messages with file support
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull().references(() => chatSessions.id),
  senderId: integer('sender_id').notNull(), // Can be user or astrologer ID
  senderType: text('sender_type').notNull(), // 'user' or 'astrologer'
  messageType: text('message_type').notNull().default('text'), // 'text', 'image', 'voice'
  content: text('content'), // Text content or file path
  fileUrl: text('file_url'), // For images and voice files
  fileName: text('file_name'), // Original file name
  fileSize: integer('file_size'), // File size in bytes
  timestamp: text('timestamp').notNull(),
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

// Payment Verifications table - Manual payment verification requests
export const paymentVerifications = sqliteTable('payment_verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  consultationId: integer('consultation_id').references(() => consultations.id),
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // UPI, Bank Transfer, etc.
  payerName: text('payer_name').notNull(),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  transactionId: text('transaction_id'),
  phoneNumber: text('phone_number').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  adminNotes: text('admin_notes'),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: text('verified_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Consultations table - Consultation requests with payment verification
export const consultations = sqliteTable('consultations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  astrologerId: integer('astrologer_id').references(() => astrologers.id),
  mode: text('mode').notNull(), // "chat", "call", "video"
  paymentStatus: text('payment_status').notNull().default('pending'), // "pending", "verified"
  requestStatus: text('request_status').notNull().default('waiting_admin'), // "waiting_admin", "approved", "rejected"
  details: text('details', { mode: 'json' }).notNull(), // Form data: name, DOB, time, place, question
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add pandits table at the end
export const pandits = sqliteTable('pandits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  specialization: text('specialization').notNull(),
  experience: integer('experience').notNull(),
  languages: text('languages').notNull(),
  rating: real('rating').default(4.5),
  pricePerHour: integer('price_per_hour').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  available: integer('available', { mode: 'boolean' }).default(true),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Subscription Requests table - Manual subscription payment verification
export const subscriptionRequests = sqliteTable('subscription_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull(), // 'basic', 'premium', 'ultimate'
  planName: text('plan_name').notNull(),
  amount: integer('amount').notNull(),
  duration: text('duration').notNull(), // '1 Month', '3 Months', '6 Months'
  paymentMethod: text('payment_method').notNull(),
  payerName: text('payer_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  transactionId: text('transaction_id'),
  paymentScreenshot: text('payment_screenshot'), // File path to uploaded screenshot
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  adminNotes: text('admin_notes'),
  approvedBy: integer('approved_by').references(() => users.id),
  requestedAt: text('requested_at').notNull(),
  processedAt: text('processed_at'),
  expiryDate: text('expiry_date'), // Set when approved
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
