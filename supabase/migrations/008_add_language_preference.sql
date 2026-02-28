-- Add language preference column to users table
-- This allows users to save their preferred language (e.g., 'en', 'sv')

ALTER TABLE users
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Update existing users to have default language
UPDATE users
SET language = 'en'
WHERE language IS NULL;

-- Add index for language lookups (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Add comment for documentation
COMMENT ON COLUMN users.language IS 'User preferred language code (ISO 639-1)';
