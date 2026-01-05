import { createClient } from "@/lib/supabase/server"

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("LinkedIn OAuth error:", error, errorDescription)
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Failed</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: '${errorDescription || error}' }, '*');
            window.close();
          </script>
          <p>Connection failed. You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }

  if (!code || !state) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Failed</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: 'Missing authorization code' }, '*');
            window.close();
          </script>
          <p>Missing authorization code. You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }

  // Decode state to get user ID
  let userId: string
  try {
    const stateData = JSON.parse(Buffer.from(state, "base64").toString())
    userId = stateData.userId
  } catch {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Failed</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: 'Invalid state parameter' }, '*');
            window.close();
          </script>
          <p>Invalid state. You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Failed</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: 'Server configuration error' }, '*');
            window.close();
          </script>
          <p>Server error. You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }

  const origin = new URL(request.url).origin
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

    // Success - close popup and notify parent
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connected!</title></head>
        <body>
          <script>
            window.opener?.postMessage({ 
              type: 'LINKEDIN_AUTH_SUCCESS', 
              data: { 
                name: '${userInfo.name || ""}',
                email: '${userInfo.email || ""}',
                picture: '${userInfo.picture || ""}'
              } 
            }, '*');
            window.close();
          </script>
          <p>LinkedIn connected successfully! You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  } catch (err) {
    console.error("LinkedIn OAuth error:", err)
    const errorMessage = err instanceof Error ? err.message : "Connection failed"
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Failed</title></head>
        <body>
          <script>
            window.opener?.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: '${errorMessage}' }, '*');
            window.close();
          </script>
          <p>Connection failed: ${errorMessage}. You can close this window.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }
}
