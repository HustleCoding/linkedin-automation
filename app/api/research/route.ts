import { createGateway, gateway, generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserAiGatewayKey } from "@/lib/ai-gateway/user-key"

const researchSchema = z.object({
  overview: z.string().describe("A comprehensive overview of the topic (2-3 paragraphs)"),
  keyInsights: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        relevance: z.enum(["high", "medium", "low"]),
      }),
    )
    .min(3)
    .max(5),
  contentAngles: z
    .array(
      z.object({
        angle: z.string(),
        hook: z.string(),
        format: z.enum(["story", "listicle", "how-to", "opinion", "case-study"]),
      }),
    )
    .min(4)
    .max(6),
  hashtags: z.array(z.string()).min(5).max(10),
  audienceInsights: z.object({
    primaryAudience: z.string(),
    painPoints: z.array(z.string()).min(2).max(4),
    motivations: z.array(z.string()).min(2).max(4),
  }),
  trendingQuestions: z.array(z.string()).min(3).max(5),
})

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { topic, depth } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const userApiKey = user ? await getUserAiGatewayKey(supabase, user.id) : null
    const provider = userApiKey ? createGateway({ apiKey: userApiKey }) : gateway

    const depthContext =
      depth === "deep"
        ? "Provide an extremely comprehensive analysis with detailed insights, multiple perspectives, and extensive content angles."
        : "Provide a solid overview with actionable insights and practical content angles."

    const { object } = await generateObject({
      model: provider("perplexity/sonar-pro"),
      schema: researchSchema,
      prompt: `You are a LinkedIn content strategist and researcher with access to real-time data. Research the following topic for LinkedIn content creation:

Topic: "${topic}"

${depthContext}

Provide:
1. A comprehensive overview of this topic as it relates to LinkedIn and professional audiences
2. Key insights that content creators should know (with relevance ratings)
3. Specific content angles with hooks that would perform well on LinkedIn
4. Relevant hashtags currently being used
5. Audience insights including who cares about this topic, their pain points, and motivations
6. Trending questions people are asking about this topic

Focus on actionable insights that can be turned into high-performing LinkedIn posts. Consider current trends and recent developments.`,
      maxOutputTokens: 3000,
    })

    const { data: historyItem, error: historyError } = await supabase
      .from("research_history")
      .insert({
        user_id: user.id,
        kind: "topic",
        query: topic,
        depth: depth || "standard",
        result: object,
      })
      .select()
      .single()

    if (historyError) {
      console.error("Failed to save research history:", historyError)
    }

    return NextResponse.json({ research: object, historyItem: historyItem || null })
  } catch (error) {
    console.error("Research API error:", error)
    return NextResponse.json({ error: "Failed to research topic" }, { status: 500 })
  }
}
