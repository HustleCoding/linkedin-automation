import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12

const getEncryptionKey = () => {
  const secret = process.env.AI_GATEWAY_KEY_ENCRYPTION_SECRET
  if (!secret) {
    throw new Error("Missing AI_GATEWAY_KEY_ENCRYPTION_SECRET")
  }
  return crypto.createHash("sha256").update(secret).digest()
}

export const encryptAiGatewayKey = (value: string) => {
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = getEncryptionKey()
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".")
}

export const decryptAiGatewayKey = (payload: string) => {
  const [ivPart, tagPart, dataPart] = payload.split(".")
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Invalid encrypted AI gateway key")
  }
  const iv = Buffer.from(ivPart, "base64")
  const tag = Buffer.from(tagPart, "base64")
  const encrypted = Buffer.from(dataPart, "base64")
  const key = getEncryptionKey()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString("utf8")
}
