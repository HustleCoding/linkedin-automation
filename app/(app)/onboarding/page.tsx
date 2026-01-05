"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Send,
  Check,
  ChevronRight,
  ChevronLeft,
  Linkedin,
  User,
  Target,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NICHES = [
  { id: "technology", label: "Technology", icon: "💻", description: "AI, SaaS, Dev Tools" },
  { id: "leadership", label: "Leadership", icon: "👔", description: "Management, Strategy" },
  { id: "sales", label: "Sales", icon: "📈", description: "B2B, Outreach, Closing" },
  { id: "marketing", label: "Marketing", icon: "📣", description: "Growth, Branding, Content" },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: "🚀", description: "Startups, Founders" },
  { id: "career", label: "Career", icon: "💼", description: "Job Search, Growth" },
  { id: "finance", label: "Finance", icon: "💰", description: "Investing, FinTech" },
  { id: "hr", label: "HR & People", icon: "👥", description: "Recruiting, Culture" },
]

const STEPS = [
  { id: 1, title: "Welcome", icon: User },
  { id: 2, title: "Your Niche", icon: Target },
  { id: 3, title: "Connect LinkedIn", icon: Linkedin },
  { id: 4, title: "Ready!", icon: Sparkles },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [displayName, setDisplayName] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("")
  const [linkedInConnected, setLinkedInConnected] = useState(false)
  const [linkedInProfile, setLinkedInProfile] = useState<{ name?: string; picture?: string } | null>(null)
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check LinkedIn connection status
  const checkLinkedInConnection = async () => {
    setIsCheckingConnection(true)
    try {
      const response = await fetch("/api/linkedin/status")
      if (response.ok) {
        const data = await response.json()
        setLinkedInConnected(data.connected)
        if (data.connected) {
          setLinkedInProfile({ name: data.name, picture: data.picture })
        }
      }
    } catch (error) {
      console.error("Failed to check LinkedIn status:", error)
    } finally {
      setIsCheckingConnection(false)
    }
  }

  useEffect(() => {
    if (currentStep === 3) {
      checkLinkedInConnection()
    }
  }, [currentStep])

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "LINKEDIN_AUTH_SUCCESS") {
        setLinkedInConnected(true)
        setLinkedInProfile(event.data.data)
        setIsConnecting(false)
      } else if (event.data.type === "LINKEDIN_AUTH_ERROR") {
        console.error("LinkedIn auth error:", event.data.error)
        setIsConnecting(false)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/linkedin/auth?origin=${window.location.origin}`)
      const data = await response.json()

      if (data.authUrl) {
        // Open LinkedIn OAuth in a popup
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
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          niche: selectedNiche,
          onboarding_completed: true,
          linkedin_connected: linkedInConnected,
        }),
      })
      router.push("/home")
    } catch (error) {
      console.error("Failed to save preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return displayName.trim().length > 0
      case 2:
        return selectedNiche !== ""
      case 3:
        return true // LinkedIn connection is optional
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center">
              <span className="text-white font-bold text-lg">LA</span>
            </div>
            <span className="font-semibold text-lg">LinkAgent</span>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    currentStep > step.id
                      ? "bg-[#0A66C2] text-white"
                      : currentStep === step.id
                        ? "bg-[#0A66C2] text-white ring-4 ring-[#0A66C2]/20"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn("w-8 h-0.5 mx-1", currentStep > step.id ? "bg-[#0A66C2]" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold">Welcome to LinkAgent</h1>
                <p className="text-muted-foreground text-lg">
                  Let&apos;s personalize your experience. First, what should we call you?
                </p>
              </div>

              <Card className="p-8">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-base">
                    Your name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground">
                    This will appear in the app and on your LinkedIn posts preview.
                  </p>
                </div>
              </Card>

              {/* Feature Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0A66C2]" />
                  </div>
                  <div>
                    <p className="font-medium">AI-Powered Writing</p>
                    <p className="text-sm text-muted-foreground">Generate viral posts in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#0A66C2]" />
                  </div>
                  <div>
                    <p className="font-medium">Trending Topics</p>
                    <p className="text-sm text-muted-foreground">Stay ahead of the curve</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#0A66C2]" />
                  </div>
                  <div>
                    <p className="font-medium">Smart Scheduling</p>
                    <p className="text-sm text-muted-foreground">Post at optimal times</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-[#0A66C2]" />
                  </div>
                  <div>
                    <p className="font-medium">Direct Publishing</p>
                    <p className="text-sm text-muted-foreground">Post to LinkedIn instantly</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Niche Selection */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold">What&apos;s your niche?</h1>
                <p className="text-muted-foreground text-lg">
                  We&apos;ll customize trending topics and content suggestions for you.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {NICHES.map((niche) => (
                  <button
                    key={niche.id}
                    onClick={() => setSelectedNiche(niche.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all hover:border-[#0A66C2]/50",
                      selectedNiche === niche.id
                        ? "border-[#0A66C2] bg-[#0A66C2]/5 ring-4 ring-[#0A66C2]/10"
                        : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{niche.icon}</span>
                      <div>
                        <p className="font-medium">{niche.label}</p>
                        <p className="text-sm text-muted-foreground">{niche.description}</p>
                      </div>
                      {selectedNiche === niche.id && <Check className="w-5 h-5 text-[#0A66C2] ml-auto" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Connect LinkedIn */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold">Connect your LinkedIn</h1>
                <p className="text-muted-foreground text-lg">
                  Link your account to publish posts directly from LinkAgent.
                </p>
              </div>

              <Card className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {linkedInConnected && linkedInProfile?.picture ? (
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={linkedInProfile.picture || "/placeholder.svg"}
                        alt={linkedInProfile.name || "LinkedIn"}
                      />
                      <AvatarFallback className="bg-green-500/10">
                        <Check className="w-10 h-10 text-green-500" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center",
                        linkedInConnected ? "bg-green-500/10" : "bg-[#0A66C2]/10",
                      )}
                    >
                      {isCheckingConnection || isConnecting ? (
                        <Loader2 className="w-10 h-10 text-[#0A66C2] animate-spin" />
                      ) : linkedInConnected ? (
                        <Check className="w-10 h-10 text-green-500" />
                      ) : (
                        <Linkedin className="w-10 h-10 text-[#0A66C2]" />
                      )}
                    </div>
                  )}

                  {linkedInConnected ? (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-green-600">LinkedIn Connected!</h3>
                        {linkedInProfile?.name && (
                          <p className="text-muted-foreground mt-1">Connected as {linkedInProfile.name}</p>
                        )}
                        <p className="text-muted-foreground mt-1">
                          You&apos;re all set to publish posts directly to LinkedIn.
                        </p>
                      </div>
                      <Button variant="outline" onClick={checkLinkedInConnection}>
                        <Check className="w-4 h-4 mr-2" />
                        Verified
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold">Connect your LinkedIn account</h3>
                        <p className="text-muted-foreground mt-1">
                          Securely authorize LinkAgent to post on your behalf.
                        </p>
                      </div>
                      <Button
                        className="bg-[#0A66C2] hover:bg-[#0A66C2]/90"
                        onClick={handleConnectLinkedIn}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Linkedin className="w-4 h-4 mr-2" />
                        )}
                        {isConnecting ? "Connecting..." : "Connect LinkedIn"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={checkLinkedInConnection}
                        disabled={isCheckingConnection}
                      >
                        {isCheckingConnection ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Check connection status
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              <p className="text-center text-sm text-muted-foreground">
                You can skip this step and connect later from Settings.
              </p>
            </div>
          )}

          {/* Step 4: Ready */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-[#0A66C2]/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-[#0A66C2]" />
                </div>
                <h1 className="text-3xl font-bold">You&apos;re all set, {displayName}!</h1>
                <p className="text-muted-foreground text-lg">
                  Your workspace is ready. Let&apos;s create your first viral LinkedIn post.
                </p>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Your setup summary:</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Niche</span>
                    <span className="font-medium capitalize">{selectedNiche}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">LinkedIn</span>
                    <span className={cn("font-medium", linkedInConnected ? "text-green-600" : "text-amber-600")}>
                      {linkedInConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 h-14 text-lg"
                  onClick={handleComplete}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Start Creating Content
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {currentStep < 4 && (
        <footer className="border-t border-border/50 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={currentStep === 1 ? "invisible" : ""}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90">
              {currentStep === 3 ? "Continue" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
