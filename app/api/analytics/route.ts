import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.AYRSHARE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Ayrshare API key not configured" }, { status: 500 })
  }

  try {
    // Get LinkedIn social analytics
    const response = await fetch("https://api.ayrshare.com/api/analytics/social", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platforms: ["linkedin"],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Ayrshare analytics error:", errorData)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
