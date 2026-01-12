import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchLinkedInPostAnalytics, normalizeLinkedInPostUrn } from "@/lib/linkedin/analytics"

const MAX_BATCH_SIZE = 25
const MIN_SYNC_INTERVAL_MINUTES = 60

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const cutoff = new Date(now.getTime() - MIN_SYNC_INTERVAL_MINUTES * 60 * 1000)
  const nowIso = now.toISOString()

  const { data: drafts, error } = await supabase
    .from("drafts")
    .select(
      [
        "id",
        "user_id",
        "linkedin_post_id",
        "last_analytics_synced_at",
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
    .eq("status", "published")
    .not("linkedin_post_id", "is", null)
    .order("last_analytics_synced_at", { ascending: true, nullsFirst: true })
    .limit(MAX_BATCH_SIZE)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!drafts || drafts.length === 0) {
    return NextResponse.json({ success: true, processed: 0, synced: 0, skipped: 0, failed: 0 })
  }

  let processed = 0
  let synced = 0
  let skipped = 0
  let failed = 0

  for (const draft of drafts) {
    processed += 1

    if (!draft.linkedin_post_id) {
      skipped += 1
      continue
    }

    if (draft.analytics_backoff_until && new Date(draft.analytics_backoff_until) > now) {
      skipped += 1
      continue
    }

    if (draft.last_analytics_synced_at && new Date(draft.last_analytics_synced_at) > cutoff) {
      skipped += 1
      continue
    }

    const { data: connection, error: connectionError } = await supabase
      .from("linkedin_connections")
      .select("access_token, expires_at")
      .eq("user_id", draft.user_id)
      .maybeSingle()

    if (connectionError || !connection) {
      failed += 1
      await supabase
        .from("drafts")
        .update({
          analytics_error: "LinkedIn not connected. Please reconnect in Settings.",
          last_analytics_synced_at: nowIso,
          analytics_backoff_until: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id)
      continue
    }

    if (new Date(connection.expires_at) < now) {
      failed += 1
      await supabase
        .from("drafts")
        .update({
          analytics_error: "LinkedIn token expired. Please reconnect in Settings.",
          last_analytics_synced_at: nowIso,
          analytics_backoff_until: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id)
      continue
    }

    const result = await fetchLinkedInPostAnalytics({
      accessToken: connection.access_token,
      postUrn: normalizeLinkedInPostUrn(draft.linkedin_post_id),
    })

    if (result.error || !result.analytics) {
      failed += 1
      await supabase
        .from("drafts")
        .update({
          analytics_error: result.error || "LinkedIn analytics unavailable.",
          last_analytics_synced_at: nowIso,
          analytics_backoff_until: result.backoffUntil || null,
        })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id)

      if (result.revoked) {
        await supabase.from("linkedin_connections").delete().eq("user_id", draft.user_id)
      }
      continue
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

    await supabase.from("drafts").update(updates).eq("id", draft.id).eq("user_id", draft.user_id)
    synced += 1
  }

  return NextResponse.json({ success: true, processed, synced, skipped, failed })
}
