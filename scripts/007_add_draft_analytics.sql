-- Add analytics fields to drafts table
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS analytics_impressions INTEGER,
ADD COLUMN IF NOT EXISTS analytics_clicks INTEGER,
ADD COLUMN IF NOT EXISTS analytics_likes INTEGER,
ADD COLUMN IF NOT EXISTS analytics_comments INTEGER,
ADD COLUMN IF NOT EXISTS analytics_shares INTEGER,
ADD COLUMN IF NOT EXISTS analytics_engagement INTEGER,
ADD COLUMN IF NOT EXISTS analytics_engagement_rate NUMERIC,
ADD COLUMN IF NOT EXISTS last_analytics_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS analytics_error TEXT,
ADD COLUMN IF NOT EXISTS analytics_backoff_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_drafts_last_analytics_synced_at ON drafts(last_analytics_synced_at);
CREATE INDEX IF NOT EXISTS idx_drafts_analytics_backoff_until ON drafts(analytics_backoff_until);
