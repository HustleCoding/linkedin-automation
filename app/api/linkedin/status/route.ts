import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: connection, error } = await supabase
      .from("linkedin_connections")
      .select("linkedin_name, linkedin_email, linkedin_picture, expires_at")
      .eq("user_id", user.id)
      .single()

    if (error || !connection) {
      return NextResponse.json({
        connected: false,
        name: null,
        email: null,
        picture: null,
      })
    }

    // Check if token is expired
    const isExpired = new Date(connection.expires_at) < new Date()

    return NextResponse.json({
      connected: !isExpired,
      expired: isExpired,
      name: connection.linkedin_name,
      email: connection.linkedin_email,
      picture: connection.linkedin_picture,
    })
  } catch (error) {
    console.error("LinkedIn status error:", error)
    return NextResponse.json({
      connected: false,
      name: null,
      email: null,
      picture: null,
    })
  }
}

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("linkedin_connections").delete().eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
