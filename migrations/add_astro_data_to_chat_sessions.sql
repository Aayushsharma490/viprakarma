-- Add astrological data columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS user_birth_date DATE,
ADD COLUMN IF NOT EXISTS user_birth_time TIME,
ADD COLUMN IF NOT EXISTS user_birth_place VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS user_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS kundali_data JSONB,
ADD COLUMN IF NOT EXISTS numerology_data JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_astrologer_id ON chat_sessions(astrologer_id);
