import { createClient } from "@/lib/supabase/server";
import { publishToLinkedIn } from "@/lib/linkedin/publish";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log(
    "[v0] Publish route - user:",
    user?.id,
    "authError:",
    authError?.message
  );

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's LinkedIn connection
  const { data: connection, error: connectionError } = await supabase
    .from("linkedin_connections")
    .select("access_token, linkedin_user_id, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log(
    "[v0] LinkedIn connection:",
    connection ? "found" : "not found",
    "error:",
    connectionError?.message
  );

  if (connectionError || !connection) {
    return NextResponse.json(
      {
        error:
          "LinkedIn not connected. Please connect your account in Settings.",
        needsReconnect: true,
      },
      { status: 400 }
    );
  }

  // Check if token is expired
  const tokenExpired = new Date(connection.expires_at) < new Date();
  console.log(
    "[v0] Token expires at:",
    connection.expires_at,
    "expired:",
    tokenExpired
  );

  if (tokenExpired) {
    return NextResponse.json(
      {
        error:
          "LinkedIn token expired. Please reconnect your account in Settings.",
        needsReconnect: true,
      },
      { status: 401 }
    );
  }

  const { draftId, content, tone, imageUrl, scheduleDate } =
    await request.json();
  console.log(
    "[v0] Post content length:",
    content?.length,
    "hasImage:",
    !!imageUrl,
    "scheduleDate:",
    scheduleDate
  );

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Note: LinkedIn API doesn't support native scheduling
  // For MVP, we'll post immediately and inform user about scheduling limitation
  if (scheduleDate) {
    const scheduledPayload = {
      content,
      tone: tone || "professional",
      image_url: imageUrl || null,
      status: "scheduled",
      scheduled_at: scheduleDate,
    };

    if (draftId) {
      const { data, error } = await supabase
        .from("drafts")
        .update(scheduledPayload)
        .eq("id", draftId)
        .eq("user_id", user.id)
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        scheduled: true,
        draftId: data?.id ?? draftId,
        message: "Post scheduled. It will be published at the scheduled time.",
      });
    }

    const { data, error } = await supabase
      .from("drafts")
      .insert({
        user_id: user.id,
        ...scheduledPayload,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scheduled: true,
      draftId: data?.id ?? null,
      message: "Post scheduled. It will be published at the scheduled time.",
    });
  }

  try {
    const publishResult = await publishToLinkedIn({
      accessToken: connection.access_token,
      linkedinUserId: connection.linkedin_user_id,
      content,
      imageUrl,
    });

    if (publishResult.error) {
      if (draftId) {
        await supabase
          .from("drafts")
          .update({
            linkedin_error: publishResult.error,
          })
          .eq("id", draftId)
          .eq("user_id", user.id);
      }

      if (publishResult.revoked) {
        await supabase
          .from("linkedin_connections")
          .delete()
          .eq("user_id", user.id);
        return NextResponse.json(
          {
            error:
              "LinkedIn access was revoked. Please reconnect your account in Settings.",
            needsReconnect: true,
          },
          { status: 401 }
        );
      }

      return NextResponse.json({ error: publishResult.error }, { status: 400 });
    }

    if (draftId) {
      await supabase
        .from("drafts")
        .update({
          status: "published",
          linkedin_post_id: publishResult.postId,
          published_at: new Date().toISOString(),
          linkedin_error: null,
        })
        .eq("id", draftId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      postId: publishResult.postId,
      postUrl: publishResult.postUrl,
    });
  } catch (error) {
    console.error("LinkedIn post error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish" },
      { status: 500 }
    );
  }
}
