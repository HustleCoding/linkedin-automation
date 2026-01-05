import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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
    // Get social accounts for this user
    const response = await fetch(`https://api.outstand.so/v1/social-accounts?userId=${user.id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch social accounts")
    }

    // Find LinkedIn account
    const linkedInAccount = result.accounts?.find((account: { platform: string }) => account.platform === "linkedin")

    return NextResponse.json({
      linkedin: {
        connected: !!linkedInAccount,
        username: linkedInAccount?.username || null,
        accountId: linkedInAccount?.id || null,
      },
    })
  } catch (error) {
    console.error("Outstand status error:", error)
    // Return not connected on error so UI can show connect button
    return NextResponse.json({
      linkedin: {
        connected: false,
        username: null,
        accountId: null,
      },
    })
  }
}
