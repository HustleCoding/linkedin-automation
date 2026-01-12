const LINKEDIN_POSTS_API = "https://api.linkedin.com/v2/posts"
const LINKEDIN_IMAGES_API = "https://api.linkedin.com/v2/images"
const MAX_LINKEDIN_POST_LENGTH = 3000

const normalizeLinkedInContent = (content: string) =>
  content.replace(/\r\n/g, "\n").replace(/[\u2028\u2029]/g, "\n").replace(/\u0000/g, "").trim()

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

interface PublishInput {
  accessToken: string
  linkedinUserId: string
  content: string
  imageUrl?: string | null
}

export interface PublishResult {
  postId: string | null
  postUrl: string | null
  error?: string
  revoked?: boolean
}

export async function publishToLinkedIn({
  accessToken,
  linkedinUserId,
  content,
  imageUrl,
}: PublishInput): Promise<PublishResult> {
  const normalizedContent = normalizeLinkedInContent(content)
  if (!normalizedContent) {
    return { postId: null, postUrl: null, error: "Content is required." }
  }
  if (normalizedContent.length > MAX_LINKEDIN_POST_LENGTH) {
    return {
      postId: null,
      postUrl: null,
      error: `LinkedIn posts are limited to ${MAX_LINKEDIN_POST_LENGTH} characters.`,
    }
  }

  const authorUrn = `urn:li:person:${linkedinUserId}`
  let imageUrn: string | null = null

  if (imageUrl) {
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
          imageUrn = null
        }
      }
    }
  }

  const postPayload: Record<string, unknown> = {
    author: authorUrn,
    commentary: normalizedContent,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
  }

  if (imageUrn) {
    postPayload.content = {
      media: {
        id: imageUrn,
      },
    }
  }

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

    return { postId: null, postUrl: null, error: errorMessage, revoked: isRevokedToken }
  }

  const postId =
    (postResult && typeof postResult === "object" && "id" in postResult && postResult.id) ||
    postResponse.headers.get("x-restli-id")

  return {
    postId: postId || null,
    postUrl: postId ? `https://www.linkedin.com/feed/update/${postId}` : null,
  }
}
