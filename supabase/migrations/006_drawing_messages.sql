-- Migration: Add drawing message support to messages table
-- Date: 2026-02-26
-- Description: Adds message_type and image_data columns to support drawing messages in Creative Break feature

-- Add message_type column (text or drawing)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Add image_data column for Base64 encoded images
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Add comments for documentation
COMMENT ON COLUMN messages.message_type IS 'Type of message: text or drawing';
COMMENT ON COLUMN messages.image_data IS 'Base64 encoded image data for drawing messages';

-- Create index on message_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
