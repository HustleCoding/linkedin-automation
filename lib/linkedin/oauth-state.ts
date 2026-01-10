import crypto from "crypto"

const DEFAULT_STATE_TTL_MS = 10 * 60 * 1000

type LinkedInOAuthStatePayload = {
  userId: string
  iat: number
  exp: number
  nonce: string
}

const base64UrlEncode = (value: string) => Buffer.from(value).toString("base64url")

const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8")

const sign = (payloadBase64Url: string, secret: string) =>
  crypto.createHmac("sha256", secret).update(payloadBase64Url).digest("base64url")

export const getLinkedInStateSecret = () => {
  const secret = process.env.LINKEDIN_STATE_SECRET || process.env.LINKEDIN_CLIENT_SECRET
  if (!secret) {
    throw new Error("Missing LINKEDIN_STATE_SECRET or LINKEDIN_CLIENT_SECRET")
  }
  return secret
}

export const createLinkedInOAuthState = (input: { userId: string; ttlMs?: number }, secret: string) => {
  const issuedAt = Date.now()
  const ttlMs = typeof input.ttlMs === "number" && input.ttlMs > 0 ? input.ttlMs : DEFAULT_STATE_TTL_MS

  const payload: LinkedInOAuthStatePayload = {
    userId: input.userId,
    iat: issuedAt,
    exp: issuedAt + ttlMs,
    nonce: crypto.randomBytes(16).toString("hex"),
  }

  const payloadBase64Url = base64UrlEncode(JSON.stringify(payload))
  const signatureBase64Url = sign(payloadBase64Url, secret)
  return `${payloadBase64Url}.${signatureBase64Url}`
}

export const verifyLinkedInOAuthState = (state: string, secret: string): LinkedInOAuthStatePayload => {
  const [payloadBase64Url, signatureBase64Url, extra] = state.split(".")

  if (!payloadBase64Url || !signatureBase64Url || extra) {
    throw new Error("Invalid state format")
  }

  const expected = sign(payloadBase64Url, secret)
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signatureBase64Url)

  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error("Invalid state signature")
  }

  const payload = JSON.parse(base64UrlDecode(payloadBase64Url)) as Partial<LinkedInOAuthStatePayload>

  if (!payload || typeof payload.userId !== "string") {
    throw new Error("Invalid state payload")
  }

  const now = Date.now()
  if (typeof payload.exp !== "number" || payload.exp < now) {
    throw new Error("State expired")
  }

  return payload as LinkedInOAuthStatePayload
}

