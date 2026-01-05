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
  ayrshare_post_id: string | null
  published_at: string | null
  ayrshare_error: string | null
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
  ayrshare_post_id?: string | null
  published_at?: string | null
  ayrshare_error?: string | null
}

export interface AyrsharePostResponse {
  status: "success" | "error"
  id?: string
  postIds?: Array<{
    platform: string
    postId: string
    postUrl: string
    status: string
  }>
  errors?: Array<{
    platform: string
    message: string
  }>
  message?: string
}

export interface AyrshareScheduleResponse extends AyrsharePostResponse {
  scheduleDate?: string
}
