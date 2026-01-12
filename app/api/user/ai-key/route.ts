import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { encryptAiGatewayKey } from "@/lib/ai-gateway/crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : ""

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    const encrypted = encryptAiGatewayKey(apiKey)
    const last4 = apiKey.slice(-4)

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          ai_gateway_key_encrypted: encrypted,
          ai_gateway_key_last4: last4,
          ai_gateway_key_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, last4 })
  } catch (error) {
    console.error("Save AI gateway key error:", error)
    return NextResponse.json({ error: "Failed to save AI gateway key" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          ai_gateway_key_encrypted: null,
          ai_gateway_key_last4: null,
          ai_gateway_key_updated_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove AI gateway key error:", error)
    return NextResponse.json({ error: "Failed to remove AI gateway key" }, { status: 500 })
  }
}
