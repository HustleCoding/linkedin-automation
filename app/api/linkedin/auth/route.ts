import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
const SCOPES = ["openid", "profile", "email", "w_member_social"]

export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "LinkedIn client ID not configured" }, { status: 500 })
  }

  // Get the origin from the request for redirect URL
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get("origin") || new URL(request.url).origin

  const redirectUri = `${origin}/api/linkedin/callback`

  // Generate state with user ID to prevent CSRF and identify user in callback
  const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString("base64")

  const authUrl = new URL(LINKEDIN_AUTH_URL)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("scope", SCOPES.join(" "))

  return NextResponse.json({ authUrl: authUrl.toString() })
}
