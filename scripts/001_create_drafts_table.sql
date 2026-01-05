-- Create drafts table for storing LinkedIn post drafts
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'professional',
  image_url TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  trend_tag TEXT,
  trend_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own drafts" 
  ON drafts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts" 
  ON drafts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" 
  ON drafts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" 
  ON drafts FOR DELETE 
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS drafts_user_id_idx ON drafts(user_id);
CREATE INDEX IF NOT EXISTS drafts_status_idx ON drafts(status);
CREATE INDEX IF NOT EXISTS drafts_scheduled_at_idx ON drafts(scheduled_at);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
