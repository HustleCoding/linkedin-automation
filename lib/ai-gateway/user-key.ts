import { decryptAiGatewayKey } from "@/lib/ai-gateway/crypto"

export const getUserAiGatewayKey = async (supabase: { from: (table: string) => any }, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("ai_gateway_key_encrypted")
      .eq("user_id", userId)
      .maybeSingle()

    if (error || !data?.ai_gateway_key_encrypted) {
      return null
    }

    return decryptAiGatewayKey(data.ai_gateway_key_encrypted)
  } catch (error) {
    console.error("Failed to decrypt AI gateway key:", error)
    return null
  }
}
