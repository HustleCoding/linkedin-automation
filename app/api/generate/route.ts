import { generateText } from "ai"
import { z } from "zod"

const requestSchema = z.object({
  type: z.enum(["hook", "draft"]),
  tone: z.enum(["professional", "conversational", "inspirational", "educational"]),
  currentContent: z.string().optional(),
  trend: z
    .object({
      tag: z.string(),
      title: z.string(),
      reason: z.string(),
      category: z.string(),
    })
    .optional(),
})

const toneDescriptions: Record<string, string> = {
  professional:
    "authoritative yet approachable, uses data and statistics boldly, focuses on actionable business insights",
  conversational:
    "friendly and relatable, like talking to a smart friend, uses 'you' and 'I' frequently, shares personal lessons",
  inspirational:
    "motivational but grounded in reality, uses contrarian takes, challenges conventional wisdom, empowers the reader",
  educational: "teaches through storytelling, breaks down complex ideas simply, uses frameworks and numbered lists",
}

const JUSTIN_WELSH_STYLE_GUIDE = `
You are writing LinkedIn posts in the style of Justin Welsh, a top LinkedIn creator with millions of followers.

CRITICAL STYLE RULES:
1. **SHORT LINES**: Each line should be 1 sentence MAX. Often just a fragment. Never write paragraphs.
2. **BOLD STATS**: When using numbers or statistics, format them for emphasis (e.g., "40x more opportunities", "270% growth", "82% of buyers")
3. **WHITE SPACE**: Use lots of line breaks. Every sentence gets its own line. Add blank lines between sections.
4. **HOOKS**: Start with a controversial statement, surprising stat, or pattern interrupt. The first line decides if people read on.
5. **NO FLUFF**: Every word must earn its place. Cut ruthlessly. If it doesn't add value, delete it.
6. **CONTRARIAN TAKES**: Challenge common beliefs. Say what others are afraid to say.
7. **PERSONAL**: Use "I" statements. Share real experiences. Be vulnerable.
8. **SCANNABLE**: Use bullets (•), numbered lists, and bold text (**text**) to make posts easy to skim.
9. **CTA AT END**: End with a question or call-to-action that invites engagement.
10. **HASHTAGS**: Only 2-3 hashtags, placed at the very end after a line break.

STRUCTURE:
- Hook (1-2 punchy lines)
- Line break
- Main content (short lines, data points, insights)
- Line break  
- Takeaway or lesson
- Line break
- CTA question
- Line break
- Hashtags

EXAMPLE FORMAT:
"""
Most people think [common belief].

They're wrong.

Here's what actually works:

• Point 1 with **bold stat**
• Point 2 with specific example
• Point 3 with actionable insight

The truth?

[Contrarian insight in 1 line]

What's your take on this?

#Hashtag1 #Hashtag2
"""
`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, tone, currentContent, trend } = requestSchema.parse(body)

    const toneDescription = toneDescriptions[tone]

    let prompt: string

    if (type === "hook") {
      prompt = `${JUSTIN_WELSH_STYLE_GUIDE}

Generate ONLY a hook (opening 1-2 lines) for a LinkedIn post.

Tone: ${tone} - ${toneDescription}

${currentContent ? `The post content is about:\n${currentContent}\n\nCreate a hook that fits this content.` : "Create a standalone attention-grabbing hook."}

Requirements:
- Maximum 2 short lines
- Must stop the scroll instantly
- Use a pattern interrupt, contrarian take, or surprising stat
- Match the ${tone} tone
- NO hashtags
- NO explanation - output ONLY the hook text`
    } else {
      if (!trend) {
        return Response.json({ error: "Trend data required for draft generation" }, { status: 400 })
      }

      prompt = `${JUSTIN_WELSH_STYLE_GUIDE}

Generate a complete LinkedIn post about this trending topic:

Topic: ${trend.tag}
Title: ${trend.title}
Why trending: ${trend.reason}
Category: ${trend.category}

Tone: ${tone} - ${toneDescription}

Requirements:
- Follow the Justin Welsh format EXACTLY
- Start with a scroll-stopping hook
- Use SHORT lines (1 sentence max each)
- Include **bold formatting** for key stats/points
- Add bullet points (•) where appropriate
- 150-200 words total
- End with engaging question
- Include ${trend.tag} naturally
- Add 2-3 relevant hashtags at the end
- NO explanation - output ONLY the post text`
    }

    const { text } = await generateText({
      model: "anthropic/claude-haiku-4.5",
      prompt,
      temperature: 0.85,
      maxTokens: 600,
    })

    return Response.json({ content: text.trim() })
  } catch (error) {
    console.error("Generate API error:", error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request data" }, { status: 400 })
    }
    return Response.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
