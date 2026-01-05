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
import { User, Linkedin, CheckCircle2, XCircle, Loader2, Shield, Bell, Palette } from "lucide-react"

function SettingsContent() {
  const [userEmail, setUserEmail] = useState<string>("")
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

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "LINKEDIN_AUTH_SUCCESS") {
        setLinkedInStatus({
          connected: true,
          name: event.data.data?.name || null,
          picture: event.data.data?.picture || null,
          loading: false,
        })
        setIsConnecting(false)
        toast({
          title: "LinkedIn Connected!",
          description: `Connected as ${event.data.data?.name || "your account"}`,
        })
      } else if (event.data.type === "LINKEDIN_AUTH_ERROR") {
        setIsConnecting(false)
        toast({
          title: "Connection failed",
          description: event.data.error || "Unable to connect LinkedIn. Please try again.",
          variant: "destructive",
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [toast])

  const getInitials = (email: string) => {
    if (!email) return "U"
    return email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
                    <AvatarFallback className="text-lg">{getInitials(userEmail)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{linkedInStatus.name || userEmail || "Loading..."}</p>
                    <p className="text-sm text-muted-foreground">Pro Plan</p>
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
                    <Input id="name" placeholder="Enter your name" defaultValue={linkedInStatus.name || ""} />
                  </div>
                </div>

                <Button>Save Changes</Button>
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

            {/* Notifications Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email notifications</p>
                    <p className="text-sm text-muted-foreground">Receive emails about your scheduled posts</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Post reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded before scheduled posts go live</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look of your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Change password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-destructive">Delete account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
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
