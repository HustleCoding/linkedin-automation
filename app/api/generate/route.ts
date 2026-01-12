import { createGateway, gateway, generateText, output } from "ai"
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

    const { output: outline } = await generateText({
      model: provider("anthropic/claude-haiku-4.5"),
      prompt: outlinePrompt,
      temperature: 0.4,
      maxTokens: 600,
      output: output.object({
        schema: outlineSchema,
        name: "post_outline",
        description: "Structured outline with hook, value points, proof, examples, CTA, hashtags.",
      }),
    })

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
