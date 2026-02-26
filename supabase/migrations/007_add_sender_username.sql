-- Add sender_username column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_username TEXT;

-- Update existing messages with username from users table
UPDATE messages
SET sender_username = users.username
FROM users
WHERE messages.sender_id = users.id
AND messages.sender_username IS NULL;
