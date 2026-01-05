import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.OUTSTAND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Outstand API key not configured" }, { status: 500 })
  }

  try {
    const { redirectUrl } = await request.json()

    // Generate connect URL from Outstand
    const response = await fetch("https://api.outstand.so/v1/social-accounts/connect", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: "linkedin",
        userId: user.id, // Use Supabase user ID as external reference
        redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || ""}/settings?connected=true`,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to generate connect URL")
    }

    return NextResponse.json({
      connectUrl: result.url || result.connectUrl,
    })
  } catch (error) {
    console.error("Outstand connect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate connect URL" },
      { status: 500 },
    )
  }
}
