import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createLinkedInOAuthState, getLinkedInStateSecret } from "@/lib/linkedin/oauth-state"

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
  const stateSecret = (() => {
    try {
      return getLinkedInStateSecret()
    } catch (error) {
      console.error("LinkedIn state secret missing:", error)
      return null
    }
  })()

  if (!clientId || !stateSecret) {
    return NextResponse.json({ error: "LinkedIn not configured" }, { status: 500 })
  }

  const origin = new URL(request.url).origin

  const redirectUri = `${origin}/api/linkedin/callback`

  const state = createLinkedInOAuthState({ userId: user.id }, stateSecret)

  const authUrl = new URL(LINKEDIN_AUTH_URL)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("scope", SCOPES.join(" "))

  return NextResponse.json({ authUrl: authUrl.toString() })
}
