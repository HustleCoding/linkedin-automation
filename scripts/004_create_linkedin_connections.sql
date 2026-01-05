-- Create linkedin_connections table to store OAuth tokens
CREATE TABLE IF NOT EXISTS linkedin_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  linkedin_name TEXT,
  linkedin_email TEXT,
  linkedin_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_user_id ON linkedin_connections(user_id);

-- Enable RLS
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own linkedin connection"
  ON linkedin_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own linkedin connection"
  ON linkedin_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linkedin connection"
  ON linkedin_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own linkedin connection"
  ON linkedin_connections FOR DELETE
  USING (auth.uid() = user_id);
