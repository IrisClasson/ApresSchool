-- Create users table for custom authentication
-- Run this in your Supabase SQL Editor
-- This script is idempotent and safe to run multiple times

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add parent_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'parent_code'
  ) THEN
    ALTER TABLE users ADD COLUMN parent_code TEXT UNIQUE;
  END IF;
END $$;

-- Add parent_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE users ADD COLUMN parent_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on parent_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_parent_code ON users(parent_code) WHERE parent_code IS NOT NULL;

-- Create index on parent_id for finding kids by parent
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id) WHERE parent_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true); -- Allow reading for login verification

-- Policy: Anyone can insert (for registration)
DROP POLICY IF EXISTS "Anyone can register" ON users;
CREATE POLICY "Anyone can register" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true) -- We'll verify in application code
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Cheer notifications table (real-time cheers that pause games)
CREATE TABLE IF NOT EXISTS cheer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT DEFAULT '🎉',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cheer notifications
CREATE INDEX IF NOT EXISTS cheer_notifications_recipient_idx ON cheer_notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cheer_notifications_is_read_idx ON cheer_notifications(is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE cheer_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all operations for now - add auth later)
DROP POLICY IF EXISTS "Enable all access for cheers" ON cheer_notifications;
CREATE POLICY "Enable all access for cheers" ON cheer_notifications FOR ALL USING (true);
