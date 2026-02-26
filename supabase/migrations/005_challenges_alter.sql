-- Drop existing challenges table if it exists (since it doesn't have the right structure)
DROP TABLE IF EXISTS challenge_sessions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- Create challenges table with proper user associations
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 0,
  time_estimate INTEGER NOT NULL,
  nag_level TEXT NOT NULL CHECK (nag_level IN ('gentle', 'normal', 'relentless')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  challenge_type TEXT,
  target_number INTEGER,
  problem_count INTEGER,
  visual_style TEXT,
  feedback JSONB,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster challenge queries
CREATE INDEX idx_challenges_kid ON challenges(kid_id, status, created_at DESC);
CREATE INDEX idx_challenges_parent ON challenges(parent_id, created_at DESC);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Create challenge_sessions table for analytics
CREATE TABLE challenge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  score_breakdown JSONB NOT NULL,
  final_score INTEGER,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for session queries
CREATE INDEX idx_sessions_kid ON challenge_sessions(kid_id, completed_at DESC);
CREATE INDEX idx_sessions_challenge ON challenge_sessions(challenge_id);

-- Enable Row Level Security
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read challenges where they are parent or kid
DROP POLICY IF EXISTS "Users can read own challenges" ON challenges;
CREATE POLICY "Users can read own challenges" ON challenges
  FOR SELECT
  USING (true);

-- Policy: Parents can create challenges for their kids
DROP POLICY IF EXISTS "Parents can create challenges" ON challenges;
CREATE POLICY "Parents can create challenges" ON challenges
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update challenges
DROP POLICY IF EXISTS "Users can update challenges" ON challenges;
CREATE POLICY "Users can update challenges" ON challenges
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Parents can delete their challenges
DROP POLICY IF EXISTS "Parents can delete challenges" ON challenges;
CREATE POLICY "Parents can delete challenges" ON challenges
  FOR DELETE
  USING (true);

-- Policies for challenge_sessions
DROP POLICY IF EXISTS "Users can read sessions" ON challenge_sessions;
CREATE POLICY "Users can read sessions" ON challenge_sessions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Kids can create sessions" ON challenge_sessions;
CREATE POLICY "Kids can create sessions" ON challenge_sessions
  FOR INSERT
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
DROP TRIGGER IF EXISTS update_challenge_timestamp ON challenges;
CREATE TRIGGER update_challenge_timestamp
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_updated_at();
