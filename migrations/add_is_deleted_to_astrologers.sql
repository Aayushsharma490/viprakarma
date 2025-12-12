-- Migration: Add isDeleted column to astrologers table
-- Run this SQL in your database

ALTER TABLE astrologers ADD COLUMN is_deleted INTEGER DEFAULT 0;

-- Update existing records to ensure they are not deleted
UPDATE astrologers SET is_deleted = 0 WHERE is_deleted IS NULL;
