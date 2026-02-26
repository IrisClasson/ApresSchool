-- Migration: Add drawing message support to messages table
-- Run this in your Supabase SQL Editor

-- Add message_type column (text or drawing)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Add image_data column for Base64 encoded images
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Add comment for documentation
COMMENT ON COLUMN messages.message_type IS 'Type of message: text or drawing';
COMMENT ON COLUMN messages.image_data IS 'Base64 encoded image data for drawing messages';
