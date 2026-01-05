-- Rename Ayrshare fields to LinkedIn naming
ALTER TABLE drafts
RENAME COLUMN IF EXISTS ayrshare_post_id TO linkedin_post_id;

ALTER TABLE drafts
RENAME COLUMN IF EXISTS ayrshare_error TO linkedin_error;

DROP INDEX IF EXISTS idx_drafts_ayrshare_post_id;
CREATE INDEX IF NOT EXISTS idx_drafts_linkedin_post_id ON drafts(linkedin_post_id);
