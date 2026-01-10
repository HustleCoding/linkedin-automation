"use client"

import { Suspense, useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { User, Linkedin, CheckCircle2, XCircle, Loader2 } from "lucide-react"

function SettingsContent() {
  const [userEmail, setUserEmail] = useState<string>("")
  const [displayName, setDisplayName] = useState("")
  const [linkedInStatus, setLinkedInStatus] = useState<{
    connected: boolean
    name: string | null
    picture: string | null
    loading: boolean
  }>({
    connected: false,
    name: null,
    picture: null,
    loading: true,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
      try {
        const response = await fetch("/api/user/preferences")
        if (response.ok) {
          const data = await response.json()
          if (data?.preferences?.display_name) {
            setDisplayName(data.preferences.display_name)
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error)
      }
    }
    loadUser()
  }, [])

  const checkLinkedInStatus = async () => {
    try {
      const res = await fetch("/api/linkedin/status")
      if (res.ok) {
        const data = await res.json()
        setLinkedInStatus({
          connected: data.connected,
          name: data.name || null,
          picture: data.picture || null,
          loading: false,
        })
      } else {
        setLinkedInStatus((prev) => ({ ...prev, loading: false }))
      }
    } catch {
      setLinkedInStatus((prev) => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    checkLinkedInStatus()
  }, [])

  useEffect(() => {
    if (!displayName && linkedInStatus.name) {
      setDisplayName(linkedInStatus.name)
    }
  }, [displayName, linkedInStatus.name])

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || typeof event.data !== "object") return
      if (!("type" in event.data)) return

      if (event.data.type === "LINKEDIN_AUTH_SUCCESS") {
        setLinkedInStatus({
          connected: true,
          name: typeof event.data.data?.name === "string" ? event.data.data.name : null,
          picture: typeof event.data.data?.picture === "string" ? event.data.data.picture : null,
          loading: false,
        })
        setIsConnecting(false)
        toast({
          title: "LinkedIn Connected!",
          description: `Connected as ${typeof event.data.data?.name === "string" ? event.data.data.name : "your account"}`,
        })
      } else if (event.data.type === "LINKEDIN_AUTH_ERROR") {
        setIsConnecting(false)
        toast({
          title: "Connection failed",
          description:
            typeof event.data.error === "string" ? event.data.error : "Unable to connect LinkedIn. Please try again.",
          variant: "destructive",
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [toast])

  const getInitials = (value: string) => {
    if (!value) return "U"
    const base = value.split("@")[0]
    const parts = base.split(/[\s._-]+/).filter(Boolean)
    return parts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveProfile = async () => {
    const trimmedName = displayName.trim()
    if (!trimmedName) {
      toast({
        title: "Display name required",
        description: "Please enter a display name to save.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: trimmedName }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      setDisplayName(trimmedName)
      window.dispatchEvent(new CustomEvent("display-name-updated", { detail: trimmedName }))
      toast({
        title: "Profile saved",
        description: "Your display name has been updated.",
      })
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Save failed",
        description: "Unable to save your display name. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/linkedin/auth?origin=${window.location.origin}`)
      const data = await response.json()

      if (data.authUrl) {
        const width = 600
        const height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        window.open(data.authUrl, "linkedin-oauth", `width=${width},height=${height},left=${left},top=${top}`)
      } else {
        throw new Error(data.error || "Failed to get auth URL")
      }
    } catch (error) {
      console.error("Failed to start LinkedIn OAuth:", error)
      setIsConnecting(false)
      toast({
        title: "Connection failed",
        description: "Unable to start LinkedIn authorization. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnectLinkedIn = async () => {
    try {
      const res = await fetch("/api/linkedin/status", { method: "DELETE" })
      if (res.ok) {
        setLinkedInStatus({
          connected: false,
          name: null,
          picture: null,
          loading: false,
        })
        toast({
          title: "LinkedIn Disconnected",
          description: "Your LinkedIn account has been disconnected.",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to disconnect LinkedIn. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden lg:ml-64">
        <div className="container max-w-4xl py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and connected services</p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={linkedInStatus.picture || undefined} alt="Profile" />
                    <AvatarFallback className="text-lg">{getInitials(displayName || userEmail)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {displayName || linkedInStatus.name || userEmail || "Loading..."}
                    </p>
                    <p className="text-sm text-muted-foreground">Free Plan</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userEmail} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={!displayName.trim()}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Connected Accounts Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  <CardTitle>Connected Accounts</CardTitle>
                </div>
                <CardDescription>Connect your social media accounts to publish content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    {linkedInStatus.connected && linkedInStatus.picture ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={linkedInStatus.picture || "/placeholder.svg"}
                          alt={linkedInStatus.name || "LinkedIn"}
                        />
                        <AvatarFallback className="bg-[#0A66C2]">
                          <Linkedin className="h-6 w-6 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0A66C2]">
                        <Linkedin className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">LinkedIn</p>
                      {linkedInStatus.loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking status...
                        </div>
                      ) : linkedInStatus.connected ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                          {linkedInStatus.name && (
                            <span className="text-muted-foreground">({linkedInStatus.name})</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-3 w-3" />
                          Not connected
                        </div>
                      )}
                    </div>
                  </div>

                  {linkedInStatus.connected ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                      <Button variant="outline" size="sm" onClick={handleDisconnectLinkedIn}>
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleConnectLinkedIn} className="gap-2" disabled={isConnecting}>
                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4" />}
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>

                {!linkedInStatus.connected && !linkedInStatus.loading && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> You need to connect your LinkedIn account to publish posts. Click the
                      Connect button to authorize LinkAgent.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
