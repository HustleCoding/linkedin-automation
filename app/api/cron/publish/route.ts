import { NextResponse } from "next/server";
import { publishToLinkedIn } from "@/lib/linkedin/publish";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BATCH_SIZE = 25;

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: drafts, error } = await supabase
    .from("drafts")
    .select("id, user_id, content, image_url, scheduled_at")
    .eq("status", "scheduled")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(MAX_BATCH_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!drafts || drafts.length === 0) {
    return NextResponse.json({
      success: true,
      processed: 0,
      published: 0,
      failed: 0,
    });
  }

  let processed = 0;
  let published = 0;
  let failed = 0;

  for (const draft of drafts) {
    processed += 1;

    if (!draft.content?.trim()) {
      failed += 1;
      await supabase
        .from("drafts")
        .update({ linkedin_error: "Content is required" })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id);
      continue;
    }

    const { data: connection, error: connectionError } = await supabase
      .from("linkedin_connections")
      .select("access_token, linkedin_user_id, expires_at")
      .eq("user_id", draft.user_id)
      .maybeSingle();

    if (connectionError || !connection) {
      failed += 1;
      await supabase
        .from("drafts")
        .update({
          linkedin_error:
            "LinkedIn not connected. Please reconnect in Settings.",
        })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id);
      continue;
    }

    const tokenExpired = new Date(connection.expires_at) < new Date();
    if (tokenExpired) {
      failed += 1;
      await supabase
        .from("drafts")
        .update({
          linkedin_error:
            "LinkedIn token expired. Please reconnect in Settings.",
        })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id);
      continue;
    }

    const publishResult = await publishToLinkedIn({
      accessToken: connection.access_token,
      linkedinUserId: connection.linkedin_user_id,
      content: draft.content,
      imageUrl: draft.image_url,
    });

    if (publishResult.error) {
      failed += 1;
      await supabase
        .from("drafts")
        .update({ linkedin_error: publishResult.error })
        .eq("id", draft.id)
        .eq("user_id", draft.user_id);

      if (publishResult.revoked) {
        await supabase
          .from("linkedin_connections")
          .delete()
          .eq("user_id", draft.user_id);
      }
      continue;
    }

    await supabase
      .from("drafts")
      .update({
        status: "published",
        linkedin_post_id: publishResult.postId,
        published_at: new Date().toISOString(),
        linkedin_error: null,
      })
      .eq("id", draft.id)
      .eq("user_id", draft.user_id);

    published += 1;
  }

  return NextResponse.json({
    success: true,
    processed,
    published,
    failed,
  });
}
