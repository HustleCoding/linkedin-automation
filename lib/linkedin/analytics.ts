const LINKEDIN_SOCIAL_ACTIONS_API = "https://api.linkedin.com/v2/socialActions"

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

const getNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const sumNumbers = (values: Array<number | null | undefined>) => {
  const filtered = values.filter((value) => typeof value === "number")
  if (filtered.length === 0) {
    return null
  }
  return filtered.reduce((total, value) => total + value, 0)
}

export const normalizeLinkedInPostUrn = (postId: string) => {
  if (!postId) {
    return postId
  }
  if (postId.startsWith("urn:")) {
    return postId
  }
  return `urn:li:share:${postId}`
}

export interface LinkedInPostAnalytics {
  impressions: number | null
  clicks: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  engagement: number | null
  engagementRate: number | null
}

export interface LinkedInAnalyticsResult {
  analytics?: LinkedInPostAnalytics
  error?: string
  revoked?: boolean
  backoffUntil?: string
  status?: number
}

export async function fetchLinkedInPostAnalytics({
  accessToken,
  postUrn,
}: {
  accessToken: string
  postUrn: string
}): Promise<LinkedInAnalyticsResult> {
  const response = await fetch(`${LINKEDIN_SOCIAL_ACTIONS_API}/${encodeURIComponent(postUrn)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202401",
    },
    cache: "no-store",
  })

  const data = await parseJsonSafely(response)

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === "object" && "message" in data && typeof data.message === "string" && data.message) ||
      response.statusText ||
      "Failed to fetch LinkedIn analytics"
    const revoked =
      data && typeof data === "object"
        ? data.code === "REVOKED_ACCESS_TOKEN" || data.serviceErrorCode === 65601
        : false

    let backoffUntil: string | undefined
    const now = Date.now()
    if (response.status === 429) {
      backoffUntil = new Date(now + 60 * 60 * 1000).toISOString()
    } else if (response.status === 403) {
      backoffUntil = new Date(now + 6 * 60 * 60 * 1000).toISOString()
    }

    return {
      error: errorMessage,
      revoked,
      backoffUntil,
      status: response.status,
    }
  }

  const likes = getNumber(data?.likesSummary?.totalCount ?? data?.likesSummary?.count)
  const comments = getNumber(data?.commentsSummary?.totalCount ?? data?.commentsSummary?.count)
  const shares = getNumber(
    data?.shareSummary?.shareCount ?? data?.shareSummary?.totalCount ?? data?.sharesSummary?.totalCount,
  )
  const impressions = getNumber(data?.impressionCount ?? data?.impressions)
  const clicks = getNumber(data?.clickCount ?? data?.clicks)
  const engagement = sumNumbers([likes, comments, shares, clicks])
  const engagementRate =
    engagement !== null && impressions && impressions > 0 ? Number((engagement / impressions).toFixed(4)) : null

  return {
    analytics: {
      impressions,
      clicks,
      likes,
      comments,
      shares,
      engagement,
      engagementRate,
    },
  }
}
