import { generateObject } from "ai"
import { z } from "zod"

const competitorSchema = z.object({
  profile: z.object({
    name: z.string(),
    headline: z.string(),
    estimatedFollowers: z.string(),
    niche: z.string(),
    postingFrequency: z.string(),
  }),
  contentStrategy: z.object({
    primaryThemes: z.array(z.string()).min(3).max(5),
    contentFormats: z.array(z.string()).min(2).max(4),
    toneOfVoice: z.string(),
    uniqueApproach: z.string(),
  }),
  topPerformingContent: z
    .array(
      z.object({
        type: z.string(),
        topic: z.string(),
        whyItWorks: z.string(),
      }),
    )
    .min(3)
    .max(5),
  lessonsToLearn: z.array(z.string()).min(3).max(5),
  gaps: z.array(z.string()).min(2).max(4),
})

export async function POST(req: Request) {
  try {
    const { profileUrl, name } = await req.json()

    if (!profileUrl && !name) {
      return Response.json({ error: "Profile URL or name is required" }, { status: 400 })
    }

    const identifier = profileUrl || name

    const { object } = await generateObject({
      model: "perplexity/sonar-pro",
      schema: competitorSchema,
      prompt: `You are a LinkedIn content strategist. Analyze this LinkedIn thought leader/competitor:

Profile: "${identifier}"

Search for information about this person's LinkedIn presence and provide:
1. Profile overview (name, headline, estimated followers, niche, posting frequency)
2. Content strategy analysis (themes, formats, tone, unique approach)
3. What types of content perform best for them and why
4. Key lessons other creators can learn from them
5. Gaps or opportunities they're missing that others could capitalize on

Focus on actionable insights that can help someone improve their own LinkedIn content strategy.`,
      maxOutputTokens: 2500,
    })

    return Response.json({ analysis: object })
  } catch (error) {
    console.error("Competitor analysis error:", error)
    return Response.json({ error: "Failed to analyze competitor" }, { status: 500 })
  }
}
