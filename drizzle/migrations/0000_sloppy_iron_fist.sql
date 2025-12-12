CREATE TABLE `astrologers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`phone` text NOT NULL,
	`specializations` text NOT NULL,
	`experience` integer NOT NULL,
	`rating` real DEFAULT 0,
	`total_consultations` integer DEFAULT 0,
	`hourly_rate` integer NOT NULL,
	`is_approved` integer DEFAULT false,
	`bio` text,
	`photo` text,
	`languages` text,
	`location` text,
	`is_online` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `astrologers_email_unique` ON `astrologers` (`email`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`astrologer_id` integer,
	`booking_type` text NOT NULL,
	`service_type` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`scheduled_time` text NOT NULL,
	`duration` integer NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`astrologer_id`) REFERENCES `astrologers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`sender_type` text NOT NULL,
	`message_type` text DEFAULT 'text' NOT NULL,
	`content` text,
	`file_url` text,
	`file_name` text,
	`file_size` integer,
	`timestamp` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`astrologer_id` integer,
	`session_type` text NOT NULL,
	`messages` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`astrologer_id`) REFERENCES `astrologers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`astrologer_id` integer,
	`mode` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`request_status` text DEFAULT 'waiting_admin' NOT NULL,
	`details` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`astrologer_id`) REFERENCES `astrologers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`is_read` integer DEFAULT false,
	`link` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pandits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`specialization` text NOT NULL,
	`experience` integer NOT NULL,
	`languages` text NOT NULL,
	`rating` real DEFAULT 4.5,
	`price_per_hour` integer NOT NULL,
	`location` text NOT NULL,
	`description` text,
	`image_url` text,
	`available` integer DEFAULT true,
	`is_approved` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`booking_id` integer,
	`subscription_id` integer,
	`consultation_id` integer,
	`amount` integer NOT NULL,
	`payment_method` text NOT NULL,
	`payer_name` text NOT NULL,
	`bank_name` text,
	`account_number` text,
	`transaction_id` text,
	`phone_number` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`verified_by` integer,
	`verified_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`booking_id` integer,
	`subscription_id` integer,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`razorpay_order_id` text NOT NULL,
	`razorpay_payment_id` text,
	`razorpay_signature` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`plan` text NOT NULL,
	`amount` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`razorpay_order_id` text NOT NULL,
	`razorpay_payment_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`date_of_birth` text,
	`time_of_birth` text,
	`place_of_birth` text,
	`subscription_plan` text DEFAULT 'free' NOT NULL,
	`subscription_expiry` text,
	`is_mahurat_subscribed` integer DEFAULT false,
	`mahurat_subscription_expiry` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`can_chat_with_astrologer` integer DEFAULT false NOT NULL,
	`active_consultation_astrologer_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`active_consultation_astrologer_id`) REFERENCES `astrologers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);