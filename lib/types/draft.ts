export type Tone = "professional" | "conversational" | "inspirational" | "educational"

export interface Draft {
  id: string
  user_id: string
  content: string
  tone: string
  image_url: string | null
  scheduled_at: string | null
  status: "draft" | "scheduled" | "published"
  trend_tag: string | null
  trend_title: string | null
  created_at: string
  updated_at: string
  linkedin_post_id: string | null
  published_at: string | null
  linkedin_error: string | null
  analytics_impressions?: number | null
  analytics_clicks?: number | null
  analytics_likes?: number | null
  analytics_comments?: number | null
  analytics_shares?: number | null
  analytics_engagement?: number | null
  analytics_engagement_rate?: number | null
  last_analytics_synced_at?: string | null
  analytics_error?: string | null
  analytics_backoff_until?: string | null
}

export interface CreateDraftInput {
  content: string
  tone: string
  image_url?: string | null
  scheduled_at?: string | null
  status?: "draft" | "scheduled" | "published"
  trend_tag?: string | null
  trend_title?: string | null
}

export interface UpdateDraftInput extends Partial<CreateDraftInput> {
  id: string
  linkedin_post_id?: string | null
  published_at?: string | null
  linkedin_error?: string | null
}
