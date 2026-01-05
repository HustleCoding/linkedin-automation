import { generateObject } from "ai"
import { z } from "zod"

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
    const { niche } = await req.json()

    const nicheContext =
      niche && niche !== "All Niches"
        ? `Focus specifically on the "${niche}" niche.`
        : "Cover a variety of professional niches including Technology, Leadership, Career, Entrepreneurship, Sales, and Marketing."

    const { object } = await generateObject({
      model: "perplexity/sonar-pro",
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

    return Response.json({ trends: trendsWithIds })
  } catch (error) {
    console.error("Error fetching trends:", error)
    return Response.json({ error: "Failed to fetch trending topics" }, { status: 500 })
  }
}
