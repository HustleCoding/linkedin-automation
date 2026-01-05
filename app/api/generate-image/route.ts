import { experimental_generateImage } from "ai"
import { z } from "zod"

const requestSchema = z.object({
  content: z.string().min(1),
  style: z.enum(["professional", "abstract", "minimal", "bold"]).default("professional"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, style } = requestSchema.parse(body)

    const styleGuide = {
      professional: "Clean corporate imagery, subtle gradients, business context, modern office aesthetic",
      abstract: "Geometric shapes, flowing lines, conceptual visualization, artistic interpretation",
      minimal: "Simple composition, lots of white space, single focal point, elegant simplicity",
      bold: "Vibrant colors, strong visual impact, dynamic composition, eye-catching design",
    }

    const result = await experimental_generateImage({
      model: "bfl/flux-pro-1.1",
      prompt: `Professional LinkedIn post image. Style: ${styleGuide[style]}. Context: ${content.slice(0, 500)}. Requirements: No text or words, no faces, clean modern aesthetic, suitable for business networking, square format.`,
      aspectRatio: "1:1",
    })

    // Extract image from the response
    const image = result.images?.[0]

    if (!image) {
      throw new Error("No image generated")
    }

    // Convert to base64 data URL
    const imageUrl = `data:${image.mimeType || "image/png"};base64,${image.base64}`

    return Response.json({ imageUrl })
  } catch (error) {
    console.error("Generate image API error:", error)
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request data" }, { status: 400 })
    }
    return Response.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
