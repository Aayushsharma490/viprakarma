DROP INDEX "astrologers_email_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "is_admin" TO "is_admin" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `astrologers_email_unique` ON `astrologers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);