import { createGateway, gateway, generateObject } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import type { Trend } from "@/lib/types/trends"
import { getUserAiGatewayKey } from "@/lib/ai-gateway/user-key"

const trendsSchema = z.object({
  trends: z
    .array(
      z.object({
        tag: z.string().describe("A hashtag format trending topic, e.g. #AIProductivity"),
        title: z.string().describe("A short descriptive title for the trend"),
        reason: z.string().describe("Why this is trending - engagement stats or context"),
        viralScore: z.number().min(0).max(100).describe("Estimated viral potential score 0-100"),
        category: z.string().describe("The niche category this belongs to"),
      }),
    )
    .min(5)
    .max(8),
})

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const requestedNiche = typeof body?.niche === "string" && body.niche.trim() ? body.niche : "All Niches"
    const shouldRefresh = Boolean(body?.refresh)

    if (!shouldRefresh) {
      const { data: cached, error: cacheError } = await supabase
        .from("trend_cache")
        .select("trends")
        .eq("user_id", user.id)
        .eq("niche", requestedNiche)
        .maybeSingle()

      if (cacheError && cacheError.code !== "PGRST116") {
        console.error("Trend cache read error:", cacheError)
      } else if (cached?.trends && Array.isArray(cached.trends) && cached.trends.length > 0) {
        return NextResponse.json({ trends: cached.trends as Trend[] })
      }
    }

    const userApiKey = user ? await getUserAiGatewayKey(supabase, user.id) : null
    const provider = userApiKey ? createGateway({ apiKey: userApiKey }) : gateway

    const nicheContext =
      requestedNiche && requestedNiche !== "All Niches"
        ? `Focus specifically on the "${requestedNiche}" niche.`
        : "Cover a variety of professional niches including Technology, Leadership, Career, Entrepreneurship, Sales, and Marketing."

    const { object } = await generateObject({
      model: provider("perplexity/sonar-pro"),
      schema: trendsSchema,
      prompt: `You are a LinkedIn content strategist with access to real-time data. Search for and identify the top 6-8 currently trending topics on LinkedIn that would make great post content.

${nicheContext}

For each trend, provide:
1. A hashtag (e.g., #AIProductivity, #RemoteWork)
2. A short descriptive title
3. Why it's trending (mention specific engagement patterns, recent events, or viral posts)
4. A viral potential score (0-100) based on current engagement levels
5. The category/niche it belongs to

Focus on trends from the last 7 days. Prioritize topics with high engagement potential for thought leadership posts. Include a mix of evergreen professional topics and timely trends.`,
      maxOutputTokens: 2000,
    })

    // Add unique IDs to each trend
    const trendsWithIds = object.trends.map((trend, index) => ({
      ...trend,
      id: `trend-${Date.now()}-${index}`,
    }))

    const { error: upsertError } = await supabase
      .from("trend_cache")
      .upsert(
        {
          user_id: user.id,
          niche: requestedNiche,
          trends: trendsWithIds,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,niche",
        },
      )

    if (upsertError) {
      console.error("Trend cache write error:", upsertError)
    }

    return NextResponse.json({ trends: trendsWithIds })
  } catch (error) {
    console.error("Error fetching trends:", error)
    return NextResponse.json({ error: "Failed to fetch trending topics" }, { status: 500 })
  }
}
