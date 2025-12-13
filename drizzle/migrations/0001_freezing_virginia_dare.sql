CREATE TABLE `pooja_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`pooja_name` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`time` text,
	`location` text NOT NULL,
	`purpose` text,
	`phone` text NOT NULL,
	`email` text,
	`occasion` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscription_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`plan_id` text NOT NULL,
	`plan_name` text NOT NULL,
	`amount` integer NOT NULL,
	`duration` text NOT NULL,
	`payment_method` text NOT NULL,
	`payer_name` text NOT NULL,
	`phone_number` text NOT NULL,
	`transaction_id` text,
	`payment_screenshot` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`approved_by` integer,
	`requested_at` text NOT NULL,
	`processed_at` text,
	`expiry_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `astrologers` ADD `is_deleted` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token_expiry` text;