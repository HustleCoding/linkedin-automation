import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ preferences: data })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { display_name, niche, onboarding_completed, linkedin_connected } = body

    // Upsert preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          display_name,
          niche,
          onboarding_completed,
          linkedin_connected,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ preferences: data })
  } catch (error) {
    console.error("Save preferences error:", error)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}
