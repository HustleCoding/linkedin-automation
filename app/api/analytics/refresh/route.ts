import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchLinkedInPostAnalytics, normalizeLinkedInPostUrn } from "@/lib/linkedin/analytics"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const draftId = body?.draftId as string | undefined

  if (!draftId) {
    return NextResponse.json({ error: "Draft id is required" }, { status: 400 })
  }

  const { data: draft, error: draftError } = await supabase
    .from("drafts")
    .select(
      [
        "id",
        "user_id",
        "linkedin_post_id",
        "analytics_backoff_until",
        "analytics_impressions",
        "analytics_clicks",
        "analytics_likes",
        "analytics_comments",
        "analytics_shares",
        "analytics_engagement",
        "analytics_engagement_rate",
      ].join(","),
    )
    .eq("id", draftId)
    .eq("user_id", user.id)
    .single()

  if (draftError || !draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 })
  }

  if (!draft.linkedin_post_id) {
    return NextResponse.json({ error: "Draft does not have a LinkedIn post yet." }, { status: 400 })
  }

  const now = new Date()
  if (draft.analytics_backoff_until && new Date(draft.analytics_backoff_until) > now) {
    return NextResponse.json(
      { error: "Analytics sync is temporarily paused. Please try again later." },
      { status: 429 },
    )
  }

  const { data: connection, error: connectionError } = await supabase
    .from("linkedin_connections")
    .select("access_token, expires_at")
    .eq("user_id", user.id)
    .single()

  if (connectionError || !connection) {
    await supabase
      .from("drafts")
      .update({
        analytics_error: "LinkedIn not connected. Please reconnect your account in Settings.",
        last_analytics_synced_at: now.toISOString(),
        analytics_backoff_until: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", draft.id)
      .eq("user_id", user.id)

    return NextResponse.json(
      { error: "LinkedIn not connected. Please reconnect your account in Settings." },
      { status: 400 },
    )
  }

  if (new Date(connection.expires_at) < now) {
    await supabase
      .from("drafts")
      .update({
        analytics_error: "LinkedIn token expired. Please reconnect your account in Settings.",
        last_analytics_synced_at: now.toISOString(),
        analytics_backoff_until: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", draft.id)
      .eq("user_id", user.id)

    return NextResponse.json(
      { error: "LinkedIn token expired. Please reconnect your account in Settings.", needsReconnect: true },
      { status: 401 },
    )
  }

  const result = await fetchLinkedInPostAnalytics({
    accessToken: connection.access_token,
    postUrn: normalizeLinkedInPostUrn(draft.linkedin_post_id),
  })

  const nowIso = now.toISOString()

  if (result.error || !result.analytics) {
    await supabase
      .from("drafts")
      .update({
        analytics_error: result.error || "LinkedIn analytics unavailable.",
        last_analytics_synced_at: nowIso,
        analytics_backoff_until: result.backoffUntil || null,
      })
      .eq("id", draft.id)
      .eq("user_id", user.id)

    if (result.revoked) {
      await supabase.from("linkedin_connections").delete().eq("user_id", user.id)
    }

    return NextResponse.json({ error: result.error || "LinkedIn analytics unavailable." }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    analytics_error: null,
    analytics_backoff_until: null,
    last_analytics_synced_at: nowIso,
  }

  if (result.analytics.impressions !== null) updates.analytics_impressions = result.analytics.impressions
  if (result.analytics.clicks !== null) updates.analytics_clicks = result.analytics.clicks
  if (result.analytics.likes !== null) updates.analytics_likes = result.analytics.likes
  if (result.analytics.comments !== null) updates.analytics_comments = result.analytics.comments
  if (result.analytics.shares !== null) updates.analytics_shares = result.analytics.shares
  if (result.analytics.engagement !== null) updates.analytics_engagement = result.analytics.engagement
  if (result.analytics.engagementRate !== null)
    updates.analytics_engagement_rate = result.analytics.engagementRate

  await supabase.from("drafts").update(updates).eq("id", draft.id).eq("user_id", user.id)

  return NextResponse.json({ success: true, analytics: result.analytics })
}
