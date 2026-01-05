import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  const apiKey = process.env.AYRSHARE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Ayrshare API key not configured" }, { status: 500 })
  }

  try {
    // Get published posts from database
    const supabase = await createServerClient()
    const { data: publishedDrafts, error: dbError } = await supabase
      .from("drafts")
      .select("*")
      .eq("status", "published")
      .not("ayrshare_post_id", "is", null)
      .order("published_at", { ascending: false })
      .limit(20)

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to fetch published posts" }, { status: 500 })
    }

    // Fetch analytics for each post from Ayrshare
    const postsWithAnalytics = await Promise.all(
      (publishedDrafts || []).map(async (draft) => {
        try {
          const analyticsResponse = await fetch("https://api.ayrshare.com/api/analytics/post", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: draft.ayrshare_post_id,
              platforms: ["linkedin"],
            }),
          })

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            return {
              ...draft,
              analytics: analyticsData.linkedin || analyticsData,
            }
          }
        } catch (err) {
          console.error(`Failed to fetch analytics for post ${draft.id}:`, err)
        }

        return {
          ...draft,
          analytics: null,
        }
      }),
    )

    return NextResponse.json({ posts: postsWithAnalytics })
  } catch (error) {
    console.error("Post analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch post analytics" }, { status: 500 })
  }
}
