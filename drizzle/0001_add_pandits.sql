-- Create pandits table
CREATE TABLE `pandits` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `name` text NOT NULL,
  `specialization` text NOT NULL,
  `experience` integer NOT NULL,
  `languages` text NOT NULL,
  `rating` real DEFAULT 4.5,
  `price_per_hour` integer NOT NULL,
  `location` text NOT NULL,
  `description` text,
  `image_url` text,
  `phone_number` text,
  `whatsapp_number` text,
  `available` integer DEFAULT true,
  `created_at` text NOT NULL
);