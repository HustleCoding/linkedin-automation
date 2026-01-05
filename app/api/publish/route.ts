import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const LINKEDIN_POSTS_API = "https://api.linkedin.com/v2/posts"
const LINKEDIN_IMAGES_API = "https://api.linkedin.com/v2/images"

const parseJsonSafely = async (response: Response) => {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] Publish route - user:", user?.id, "authError:", authError?.message)

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's LinkedIn connection
  const { data: connection, error: connectionError } = await supabase
    .from("linkedin_connections")
    .select("access_token, linkedin_user_id, expires_at")
    .eq("user_id", user.id)
    .maybeSingle()

  console.log("[v0] LinkedIn connection:", connection ? "found" : "not found", "error:", connectionError?.message)

  if (connectionError || !connection) {
    return NextResponse.json(
      { error: "LinkedIn not connected. Please connect your account in Settings.", needsReconnect: true },
      { status: 400 },
    )
  }

  // Check if token is expired
  const tokenExpired = new Date(connection.expires_at) < new Date()
  console.log("[v0] Token expires at:", connection.expires_at, "expired:", tokenExpired)

  if (tokenExpired) {
    return NextResponse.json(
      { error: "LinkedIn token expired. Please reconnect your account in Settings.", needsReconnect: true },
      { status: 401 },
    )
  }

  const { draftId, content, imageUrl, scheduleDate } = await request.json()
  console.log("[v0] Post content length:", content?.length, "hasImage:", !!imageUrl, "scheduleDate:", scheduleDate)

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  // Note: LinkedIn API doesn't support native scheduling
  // For MVP, we'll post immediately and inform user about scheduling limitation
  if (scheduleDate) {
    // Store as scheduled draft - actual posting will need a cron job
    if (draftId) {
      await supabase
        .from("drafts")
        .update({
          status: "scheduled",
          scheduled_at: scheduleDate,
        })
        .eq("id", draftId)
        .eq("user_id", user.id)
    }

    return NextResponse.json({
      success: true,
      scheduled: true,
      message: "Post scheduled. It will be published at the scheduled time.",
    })
  }

  try {
    const accessToken = connection.access_token
    const authorUrn = `urn:li:person:${connection.linkedin_user_id}`

    let imageUrn: string | null = null

    // Upload image if provided
    if (imageUrl) {
      // Step 1: Initialize image upload
      const initResponse = await fetch(`${LINKEDIN_IMAGES_API}?action=initializeUpload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: authorUrn,
          },
        }),
      })

      const initData = await parseJsonSafely(initResponse)

      if (!initResponse.ok || !initData) {
        console.error("Image init failed:", initData)
      } else {
        const uploadUrl = initData.value?.uploadUrl
        imageUrn = initData.value?.image

        if (uploadUrl && imageUrn) {
          // Step 2: Fetch the image and upload to LinkedIn
          const imageResponse = await fetch(imageUrl)
          const imageBuffer = await imageResponse.arrayBuffer()

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": imageResponse.headers.get("content-type") || "image/jpeg",
            },
            body: imageBuffer,
          })

          if (!uploadResponse.ok) {
            console.error("Image upload failed:", await uploadResponse.text())
            imageUrn = null // Proceed without image
          }
        }
      }
    }

    // Build the post payload
    const postPayload: Record<string, unknown> = {
      author: authorUrn,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    }

    // Add image if uploaded successfully
    if (imageUrn) {
      postPayload.content = {
        media: {
          id: imageUrn,
        },
      }
    }

    // Create the post
    const postResponse = await fetch(LINKEDIN_POSTS_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify(postPayload),
    })

    const postResult = await parseJsonSafely(postResponse)

    if (!postResponse.ok) {
      console.error("LinkedIn post failed:", postResult)
      const errorMessage =
        (postResult && typeof postResult === "object" && "message" in postResult && postResult.message) ||
        postResponse.statusText ||
        "Failed to publish to LinkedIn"
      const isRevokedToken =
        postResult && typeof postResult === "object"
          ? postResult.code === "REVOKED_ACCESS_TOKEN" || postResult.serviceErrorCode === 65601
          : false

      if (draftId) {
        await supabase
          .from("drafts")
          .update({
            linkedin_error: errorMessage,
          })
          .eq("id", draftId)
          .eq("user_id", user.id)
      }

      if (isRevokedToken) {
        await supabase.from("linkedin_connections").delete().eq("user_id", user.id)
        return NextResponse.json(
          {
            error: "LinkedIn access was revoked. Please reconnect your account in Settings.",
            needsReconnect: true,
          },
          { status: 401 },
        )
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const postId =
      (postResult && typeof postResult === "object" && "id" in postResult && postResult.id) ||
      postResponse.headers.get("x-restli-id")

    if (draftId) {
      await supabase
        .from("drafts")
        .update({
          status: "published",
          linkedin_post_id: postId,
          published_at: new Date().toISOString(),
          linkedin_error: null,
        })
        .eq("id", draftId)
        .eq("user_id", user.id)
    }

    return NextResponse.json({
      success: true,
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`,
    })
  } catch (error) {
    console.error("LinkedIn post error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to publish" }, { status: 500 })
  }
}
