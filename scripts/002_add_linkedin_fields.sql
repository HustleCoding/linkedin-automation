-- Add LinkedIn tracking fields to drafts table
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS linkedin_error TEXT;

-- Create index for faster lookups by linkedin_post_id
CREATE INDEX IF NOT EXISTS idx_drafts_linkedin_post_id ON drafts(linkedin_post_id);
