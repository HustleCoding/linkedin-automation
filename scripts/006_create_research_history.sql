-- Create research history table for topic research and competitor analyses
CREATE TABLE IF NOT EXISTS research_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('topic', 'competitor')),
  query TEXT NOT NULL,
  depth TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own research history"
  ON research_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research history"
  ON research_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research history"
  ON research_history FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS research_history_user_id_idx ON research_history(user_id);
CREATE INDEX IF NOT EXISTS research_history_kind_idx ON research_history(kind);
CREATE INDEX IF NOT EXISTS research_history_created_at_idx ON research_history(created_at DESC);
