-- Add Ayrshare tracking fields to drafts table
ALTER TABLE drafts 
ADD COLUMN IF NOT EXISTS ayrshare_post_id TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ayrshare_error TEXT;

-- Create index for faster lookups by ayrshare_post_id
CREATE INDEX IF NOT EXISTS idx_drafts_ayrshare_post_id ON drafts(ayrshare_post_id);
