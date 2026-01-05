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
        linkedin: {
          connected: false,
          username: null,
          name: null,
          picture: null,
        },
      })
    }

    // Check if token is expired
    const isExpired = new Date(connection.expires_at) < new Date()

    return NextResponse.json({
      linkedin: {
        connected: !isExpired,
        expired: isExpired,
        username: connection.linkedin_email,
        name: connection.linkedin_name,
        picture: connection.linkedin_picture,
      },
    })
  } catch (error) {
    console.error("Social status error:", error)
    return NextResponse.json({
      linkedin: {
        connected: false,
        username: null,
        name: null,
        picture: null,
      },
    })
  }
}
