import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ draft: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json({ error: "Invalid draft id" }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const setUpdate = (key: string, value: unknown) => {
    if (value !== undefined) {
      updates[key] = value;
    }
  };

  if ("content" in body) setUpdate("content", body.content);
  if ("tone" in body) setUpdate("tone", body.tone);
  if ("image_url" in body) setUpdate("image_url", body.image_url);
  if ("scheduled_at" in body) setUpdate("scheduled_at", body.scheduled_at);
  if ("status" in body) setUpdate("status", body.status);
  if ("trend_tag" in body) setUpdate("trend_tag", body.trend_tag);
  if ("trend_title" in body) setUpdate("trend_title", body.trend_title);
  if ("ayrshare_post_id" in body)
    setUpdate("ayrshare_post_id", body.ayrshare_post_id);
  if ("published_at" in body) setUpdate("published_at", body.published_at);
  if ("ayrshare_error" in body) setUpdate("ayrshare_error", body.ayrshare_error);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("drafts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("drafts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
