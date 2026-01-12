import { createGateway, gateway, generateObject, generateText } from "ai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { getUserAiGatewayKey } from "@/lib/ai-gateway/user-key"

const postTypes = ["how-to", "teardown", "checklist", "case-study", "contrarian", "story"] as const
type PostType = (typeof postTypes)[number]

const requestSchema = z.object({
  type: z.enum(["hook", "draft"]),
  tone: z.enum(["professional", "conversational", "inspirational", "educational"]),
  postType: z.enum(postTypes).optional(),
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

const postTypeGuides: Record<PostType, { label: string; guidance: string }> = {
  "how-to": {
    label: "How-to",
    guidance: "Teach a repeatable process with clear steps and outcomes.",
  },
  teardown: {
    label: "Teardown",
    guidance: "Break down why something works, highlight the mechanics and tradeoffs.",
  },
  checklist: {
    label: "Checklist",
    guidance: "Provide a practical checklist with concrete, scannable items.",
  },
  "case-study": {
    label: "Case study",
    guidance: "Share context, actions taken, and measurable results.",
  },
  contrarian: {
    label: "Contrarian",
    guidance: "Challenge a common belief with evidence and a better alternative.",
  },
  story: {
    label: "Story",
    guidance: "Tell a narrative arc that lands on a clear, actionable lesson.",
  },
}

const outlineSchema = z.object({
  hook: z.string(),
  valuePoints: z.array(z.string()).min(3).max(6),
  proofPoints: z.array(z.string()).min(1).max(3),
  examples: z.array(z.string()).min(1).max(3),
  cta: z.string(),
  hashtags: z.array(z.string()).min(2).max(4),
})

type Outline = z.infer<typeof outlineSchema>

const sanitizeJsonText = (rawText: string) => {
  const withoutTags = rawText.replace(/<\/?parameter[^>]*>/gi, "")
  const withoutFences = withoutTags.replace(/```(?:json)?/gi, "")
  const start = withoutFences.indexOf("{")
  const end = withoutFences.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) {
    return withoutFences.trim()
  }
  return withoutFences.slice(start, end + 1)
}

const coerceStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    const filtered = value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    return filtered.length > 0 ? filtered : null
  }
  if (typeof value === "string") {
    const match = value.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
          return filtered.length > 0 ? filtered : null
        }
      } catch {
        // Fall back to line parsing below.
      }
    }
    const items = value
      .split("\n")
      .map((line) => line.replace(/^[-•✓\s]+/, "").trim())
      .filter(Boolean)
    return items.length > 0 ? items : null
  }
  return null
}

const normalizeOutline = (value: unknown): Outline | null => {
  if (!value || typeof value !== "object") {
    return null
  }
  const record = value as Record<string, unknown>
  const outline: Outline = {
    hook: typeof record.hook === "string" ? record.hook.trim() : "",
    valuePoints: coerceStringArray(record.valuePoints) || [],
    proofPoints: coerceStringArray(record.proofPoints) || [],
    examples: coerceStringArray(record.examples) || [],
    cta: typeof record.cta === "string" ? record.cta.trim() : "",
    hashtags: coerceStringArray(record.hashtags) || [],
  }

  const result = outlineSchema.safeParse(outline)
  return result.success ? result.data : null
}

const parseOutlineFromText = (rawText: string) => {
  const cleaned = sanitizeJsonText(rawText)
  try {
    const parsed = JSON.parse(cleaned)
    return normalizeOutline(parsed)
  } catch {
    return null
  }
}

const buildOutlineFallback = (trend: { tag: string; title: string; reason: string }): Outline => ({
  hook: `A practical ${trend.title} checklist I wish I had earlier.`,
  valuePoints: [
    `What changed about ${trend.title} this week, and why it matters now.`,
    "The common mistake that keeps results flat.",
    "A simple adjustment you can apply today without extra tools.",
  ],
  proofPoints: [`Observed across LinkedIn: ${trend.reason}`],
  examples: [`Example: apply the checklist to your next post and compare results.`],
  cta: "What are you testing this week?",
  hashtags: [trend.tag, "#LinkedIn", "#ContentStrategy"],
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const body = await request.json()
    const { type, tone, postType: postTypeInput, currentContent, trend } = requestSchema.parse(body)

    const userApiKey = user ? await getUserAiGatewayKey(supabase, user.id) : null
    const provider = userApiKey ? createGateway({ apiKey: userApiKey }) : gateway

    const toneDescription = toneDescriptions[tone]
    const postType: PostType = postTypeInput || "how-to"
    const postTypeGuide = postTypeGuides[postType]

    const sourceNotes = trend
      ? [
          `Trend tag: ${trend.tag}`,
          `Title: ${trend.title}`,
          `Why trending: ${trend.reason}`,
          `Category: ${trend.category}`,
        ].join("\n")
      : currentContent
        ? `Current content:\n${currentContent}`
        : "No additional source notes provided."

    const rubric = [
      "Specificity > generic advice",
      "Actionable steps or checklist items",
      "Concrete examples",
      "Clear structure: hook -> value -> proof -> CTA",
    ].join("\n- ")

    if (type === "hook") {
      const hookPrompt = `Write a 1-2 line hook for a LinkedIn post.

Post type: ${postTypeGuide.label} (${postTypeGuide.guidance})
Tone: ${tone} - ${toneDescription}

Source notes:
${sourceNotes}

Rules:
- 1-2 short lines, no hashtags
- Promise concrete value, avoid vague advice
- No markdown or special formatting
- Output ONLY the hook text`

      const { text } = await generateText({
        model: provider("anthropic/claude-haiku-4.5"),
        prompt: hookPrompt,
        temperature: 0.75,
        maxTokens: 120,
      })

      const cleanedText = text.replace(/\*\*/g, "").trim()
      return Response.json({ content: cleanedText })
    }

    if (!trend) {
      return Response.json({ error: "Trend data required for draft generation" }, { status: 400 })
    }

    const outlinePrompt = `Create a structured outline for a LinkedIn post.

Post type: ${postTypeGuide.label} (${postTypeGuide.guidance})
Tone: ${tone} - ${toneDescription}

Rubric:
- ${rubric}

Source notes:
${sourceNotes}

Requirements:
- Make value points specific and actionable
- Include at least one concrete example
- Provide 2-4 relevant hashtags (include ${trend.tag})
- Keep phrases short and scannable
- Return only a JSON object that matches the schema exactly`

    let outline = await (async () => {
      try {
        const { object } = await generateObject({
          model: provider("anthropic/claude-haiku-4.5"),
          schema: outlineSchema,
          prompt: outlinePrompt,
          temperature: 0.5,
          maxOutputTokens: 600,
          maxRetries: 1,
          experimental_repairText: async ({ text }) => {
            const repaired = parseOutlineFromText(text)
            return repaired ? JSON.stringify(repaired) : null
          },
        })
        return object
      } catch (error) {
        console.error("Outline generation failed, using fallback:", error)
        return buildOutlineFallback(trend)
      }
    })()

    const draftPrompt = `Write the final LinkedIn post using the outline below.

Post type: ${postTypeGuide.label} (${postTypeGuide.guidance})
Tone: ${tone} - ${toneDescription}

Rubric:
- ${rubric}

Outline:
Hook: ${outline.hook}
Value points:
${outline.valuePoints.map((point) => `- ${point}`).join("\n")}
Proof points:
${outline.proofPoints.map((point) => `- ${point}`).join("\n")}
Examples:
${outline.examples.map((example) => `- ${example}`).join("\n")}
CTA: ${outline.cta}
Hashtags: ${outline.hashtags.join(" ")}

Rules:
- 140-220 words
- Use line breaks to separate sections
- Use bullets or numbers when it improves clarity (no markdown)
- End with the CTA, then hashtags on the final line
- After drafting, self-critique against the rubric and fix any gaps
- Output ONLY the final post text`

    const { text } = await generateText({
      model: provider("anthropic/claude-haiku-4.5"),
      prompt: draftPrompt,
      temperature: 0.8,
      maxTokens: 900,
    })

    const cleanedText = text.replace(/\*\*/g, "").trim()
    return Response.json({ content: cleanedText })
  } catch (error) {
    console.error("Generate API error:", error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request data" }, { status: 400 })
    }
    return Response.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
