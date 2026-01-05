import { generateObject } from "ai"
import { z } from "zod"

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
  try {
    const { topic, depth } = await req.json()

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 })
    }

    const depthContext =
      depth === "deep"
        ? "Provide an extremely comprehensive analysis with detailed insights, multiple perspectives, and extensive content angles."
        : "Provide a solid overview with actionable insights and practical content angles."

    const { object } = await generateObject({
      model: "perplexity/sonar-pro",
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

    return Response.json({ research: object })
  } catch (error) {
    console.error("Research API error:", error)
    return Response.json({ error: "Failed to research topic" }, { status: 500 })
  }
}
