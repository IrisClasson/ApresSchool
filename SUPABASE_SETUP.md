# Supabase Setup Guide for ApresSchool

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in:
   - **Project Name**: ApresSchool
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## 2. Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Configure Your App

Add these to your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Schema

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_estimate INTEGER NOT NULL,
  nag_level TEXT NOT NULL CHECK (nag_level IN ('gentle', 'normal', 'relentless')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed')),
  challenge_type TEXT,
  target_number INTEGER,
  problem_count INTEGER,
  visual_style TEXT,
  feedback JSONB,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Indexes for common queries
  created_at_idx TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge sessions table (for stats/analytics)
CREATE TABLE challenge_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  score_breakdown JSONB NOT NULL, -- { correct, wrong, total }
  final_score INTEGER,
  feedback JSONB, -- { sentiment, difficulty, comment, timestamp }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kid stats table
CREATE TABLE kid_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id TEXT NOT NULL UNIQUE, -- for now just use 'kid-1', later add auth
  points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presence tracking table
CREATE TABLE presence (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
  status TEXT NOT NULL CHECK (status IN ('online', 'away', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for kid-parent communication
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'kid')),
  recipient_id TEXT NOT NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('parent', 'kid')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cheer notifications table (real-time cheers that pause games)
CREATE TABLE cheer_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT DEFAULT '🎉',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX challenges_status_idx ON challenges(status);
CREATE INDEX challenges_created_at_idx ON challenges(created_at DESC);
CREATE INDEX sessions_challenge_id_idx ON challenge_sessions(challenge_id);
CREATE INDEX sessions_completed_at_idx ON challenge_sessions(completed_at DESC);
CREATE INDEX messages_recipient_idx ON messages(recipient_id, created_at DESC);
CREATE INDEX messages_sender_idx ON messages(sender_id, created_at DESC);
CREATE INDEX messages_is_read_idx ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX cheer_notifications_recipient_idx ON cheer_notifications(recipient_id, created_at DESC);
CREATE INDEX cheer_notifications_is_read_idx ON cheer_notifications(is_read) WHERE is_read = FALSE;

-- Insert default kid stats
INSERT INTO kid_stats (kid_id, points, badges, streak)
VALUES ('kid-1', 0, '{}', 0)
ON CONFLICT (kid_id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheer_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - add auth later)
CREATE POLICY "Enable all access for challenges" ON challenges FOR ALL USING (true);
CREATE POLICY "Enable all access for sessions" ON challenge_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for kid stats" ON kid_stats FOR ALL USING (true);
CREATE POLICY "Enable all access for presence" ON presence FOR ALL USING (true);
CREATE POLICY "Enable all access for messages" ON messages FOR ALL USING (true);
CREATE POLICY "Enable all access for cheers" ON cheer_notifications FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_kid_stats_updated_at
  BEFORE UPDATE ON kid_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presence_updated_at
  BEFORE UPDATE ON presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 5. Enable Realtime (Optional but Recommended)

For real-time presence and live updates:

1. Go to **Database** → **Replication** in Supabase
2. Enable replication for these tables:
   - `challenges`
   - `presence`
   - `kid_stats`
   - `messages` (for real-time chat)
   - `cheer_notifications` (for real-time cheers)

## 6. Test the Connection

Restart your dev server after adding credentials:

```bash
npm run dev
```

The app will automatically detect Supabase credentials and switch from localStorage to Supabase!

## 7. Migrate Existing localStorage Data (Optional)

If you have test data in localStorage, you can export it:

```javascript
// Run in browser console
const challenges = JSON.parse(localStorage.getItem('challenges') || '[]')
const sessions = JSON.parse(localStorage.getItem('challengeSessions') || '[]')
const stats = JSON.parse(localStorage.getItem('kidStats') || '{}')

console.log('Challenges:', challenges)
console.log('Sessions:', sessions)
console.log('Stats:', stats)
```

Then manually insert into Supabase via the Table Editor.

## 8. Future Enhancements

Once basic setup works, you can add:

- **Authentication**: Use Supabase Auth for parent/kid login
- **Real-time subscriptions**: Live updates when challenges are created/completed
- **Storage**: Use Supabase Storage for challenge attachments/images
- **Row Level Security**: Restrict data access by user role

## Troubleshooting

### App still using localStorage
- Check `.env` file has correct credentials
- Restart dev server (`npm run dev`)
- Check browser console for errors

### Database connection errors
- Verify project URL and anon key are correct
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure SQL schema was executed successfully

### CORS errors
- Supabase should allow your localhost by default
- If deploying, add your production domain in Supabase Settings → API

## Architecture Notes

The app is designed to work **offline-first**:
- Uses localStorage as fallback
- Supabase operations are drop-in replacements
- Same API interface (`localDB.getChallenges()` becomes async when using Supabase)

When Supabase is configured, the app will:
✅ Store challenges in the cloud
✅ Sync across devices
✅ Enable real-time presence
✅ Provide analytics/stats dashboard
✅ Support future authentication

---

**Need help?** Check the Supabase docs at [supabase.com/docs](https://supabase.com/docs)
