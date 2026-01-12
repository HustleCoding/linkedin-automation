-- Add AI gateway key fields to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS ai_gateway_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS ai_gateway_key_last4 TEXT,
ADD COLUMN IF NOT EXISTS ai_gateway_key_updated_at TIMESTAMPTZ;
