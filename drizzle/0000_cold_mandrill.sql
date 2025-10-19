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
	`is_admin` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);