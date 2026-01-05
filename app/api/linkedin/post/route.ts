import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const LINKEDIN_POSTS_API = "https://api.linkedin.com/v2/posts"
const LINKEDIN_IMAGES_API = "https://api.linkedin.com/v2/images"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's LinkedIn connection
  const { data: connection, error: connectionError } = await supabase
    .from("linkedin_connections")
    .select("access_token, linkedin_user_id, expires_at")
    .eq("user_id", user.id)
    .single()

  if (connectionError || !connection) {
    return NextResponse.json(
      { error: "LinkedIn not connected. Please connect your account in Settings.", needsReconnect: true },
      { status: 400 },
    )
  }

  // Check if token is expired
  if (new Date(connection.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "LinkedIn token expired. Please reconnect your account in Settings.", needsReconnect: true },
      { status: 401 },
    )
  }

  const { draftId, content, imageUrl } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
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

      const initData = await initResponse.json()

      if (!initResponse.ok) {
        console.error("Image init failed:", initData)
        throw new Error("Failed to initialize image upload")
      }

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

    const postResult = await postResponse.json()

    if (!postResponse.ok) {
      console.error("LinkedIn post failed:", postResult)
      const errorMessage = postResult.message || "Failed to publish to LinkedIn"
      const isRevokedToken = postResult.code === "REVOKED_ACCESS_TOKEN" || postResult.serviceErrorCode === 65601

      // Update draft with error if we have a draftId
      if (draftId) {
        await supabase
          .from("drafts")
          .update({
            ayrshare_error: errorMessage,
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

    // Extract post ID from response
    const postId = postResult.id || postResponse.headers.get("x-restli-id")

    // Update draft with success info if we have a draftId
    if (draftId) {
      await supabase
        .from("drafts")
        .update({
          status: "published",
          ayrshare_post_id: postId,
          published_at: new Date().toISOString(),
          ayrshare_error: null,
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
