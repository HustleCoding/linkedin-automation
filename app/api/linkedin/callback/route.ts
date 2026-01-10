import { createClient } from "@/lib/supabase/server"
import { getLinkedInStateSecret, verifyLinkedInOAuthState } from "@/lib/linkedin/oauth-state"

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

const safeJsonForInlineScript = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")

const renderPopupResponse = (input: { origin: string; message: unknown; title: string; bodyText: string }) => {
  const payload = safeJsonForInlineScript(input.message)
  const targetOrigin = safeJsonForInlineScript(input.origin)

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head><title>${input.title}</title></head>
      <body>
        <script>
          (function () {
            try {
              var payload = ${payload};
              var targetOrigin = ${targetOrigin};
              window.opener && window.opener.postMessage(payload, targetOrigin);
            } catch (e) {}
            window.close();
          })();
        </script>
        <p>${input.bodyText}</p>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } },
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const origin = new URL(request.url).origin

  // Handle OAuth errors
  if (error) {
    console.error("LinkedIn OAuth error:", error, errorDescription)
    return renderPopupResponse({
      origin,
      title: "LinkedIn Connection Failed",
      bodyText: "Connection failed. You can close this window.",
      message: { type: "LINKEDIN_AUTH_ERROR", error: String(errorDescription || error) },
    })
  }

  if (!code || !state) {
    return renderPopupResponse({
      origin,
      title: "LinkedIn Connection Failed",
      bodyText: "Missing authorization code. You can close this window.",
      message: { type: "LINKEDIN_AUTH_ERROR", error: "Missing authorization code" },
    })
  }

  let userId: string
  try {
    const secret = getLinkedInStateSecret()
    const payload = verifyLinkedInOAuthState(state, secret)
    userId = payload.userId
  } catch (stateError) {
    console.error("LinkedIn OAuth state error:", stateError)
    return renderPopupResponse({
      origin,
      title: "LinkedIn Connection Failed",
      bodyText: "Invalid state. You can close this window.",
      message: { type: "LINKEDIN_AUTH_ERROR", error: "Invalid state parameter" },
    })
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return renderPopupResponse({
      origin,
      title: "LinkedIn Connection Failed",
      bodyText: "Server error. You can close this window.",
      message: { type: "LINKEDIN_AUTH_ERROR", error: "Server configuration error" },
    })
  }

  const redirectUri = `${origin}/api/linkedin/callback`

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData)
      throw new Error(tokenData.error_description || "Failed to get access token")
    }

    const { access_token, expires_in, refresh_token } = tokenData

    // Get user profile info
    const userInfoResponse = await fetch(LINKEDIN_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    if (!userInfoResponse.ok) {
      console.error("User info fetch failed:", userInfo)
      throw new Error("Failed to get LinkedIn profile")
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // Store connection in database
    const supabase = await createClient()

    const { error: upsertError } = await supabase.from("linkedin_connections").upsert(
      {
        user_id: userId,
        linkedin_user_id: userInfo.sub,
        access_token,
        refresh_token: refresh_token || null,
        expires_at: expiresAt.toISOString(),
        linkedin_name: userInfo.name,
        linkedin_email: userInfo.email,
        linkedin_picture: userInfo.picture,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (upsertError) {
      console.error("Database error:", upsertError)
      throw new Error("Failed to save connection")
    }

    return renderPopupResponse({
      origin,
      title: "LinkedIn Connected!",
      bodyText: "LinkedIn connected successfully! You can close this window.",
      message: {
        type: "LINKEDIN_AUTH_SUCCESS",
        data: {
          name: typeof userInfo.name === "string" ? userInfo.name : null,
          email: typeof userInfo.email === "string" ? userInfo.email : null,
          picture: typeof userInfo.picture === "string" ? userInfo.picture : null,
        },
      },
    })
  } catch (err) {
    console.error("LinkedIn OAuth error:", err)
    const errorMessage = err instanceof Error ? err.message : "Connection failed"
    return renderPopupResponse({
      origin,
      title: "LinkedIn Connection Failed",
      bodyText: "Connection failed. You can close this window.",
      message: { type: "LINKEDIN_AUTH_ERROR", error: String(errorMessage) },
    })
  }
}
