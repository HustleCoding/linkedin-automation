-- Create trend_cache table for storing generated trends per user and niche
CREATE TABLE IF NOT EXISTS trend_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  niche TEXT NOT NULL,
  trends JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, niche)
);

-- Enable Row Level Security
ALTER TABLE trend_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trend cache"
  ON trend_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trend cache"
  ON trend_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trend cache"
  ON trend_cache FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS trend_cache_user_id_idx ON trend_cache(user_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_trend_cache_updated_at ON trend_cache;
CREATE TRIGGER update_trend_cache_updated_at
  BEFORE UPDATE ON trend_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
