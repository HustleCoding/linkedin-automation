"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TrendDiscovery } from "@/components/content-lab/trend-discovery"
import { AIWorkspace } from "@/components/content-lab/ai-workspace"
import { SchedulingBar } from "@/components/content-lab/scheduling-bar"
import { DraftsPanel } from "@/components/content-lab/drafts-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { useDrafts } from "@/hooks/use-drafts"
import type { Tone } from "@/lib/types/draft"
import type { Trend } from "@/lib/types/trends"
import { FileText, PenLine, Sparkles } from "lucide-react"

export interface EditorState {
  content: string
  tone: Tone
  isGenerating: boolean
  postImage: string | null
  isGeneratingImage: boolean
}

function ContentLabContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { drafts } = useDrafts()

  const [editorState, setEditorState] = useState<EditorState>({
    content: "",
    tone: "professional",
    isGenerating: false,
    postImage: null,
    isGeneratingImage: false,
  })
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string | undefined>("09:00")
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isDraftsPanelOpen, setIsDraftsPanelOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const draftCount = drafts?.filter((d) => d.status === "draft").length || 0
  const scheduledCount = drafts?.filter((d) => d.status === "scheduled").length || 0
  const publishedCount = drafts?.filter((d) => d.status === "published").length || 0

  const heroHighlights = [
    {
      label: "Drafts",
      value: draftCount,
      helper: "In progress",
      tone: "text-foreground",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      helper: "Ready to publish",
      tone: "text-primary",
    },
    {
      label: "Published",
      value: publishedCount,
      helper: "Live on LinkedIn",
      tone: "text-foreground",
    },
  ]

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login")
      } else {
        setIsAuthenticated(true)
      }
    })
  }, [router])

  // Load draft from URL param
  useEffect(() => {
    const draftId = searchParams.get("draft")
    if (draftId && drafts) {
      const draft = drafts.find((d) => d.id === draftId)
      if (draft) {
        setEditorState((prev) => ({
          ...prev,
          content: draft.content || "",
          tone: draft.tone || "professional",
          postImage: draft.image_url || null,
        }))
        setCurrentDraftId(draft.id)
        if (draft.scheduled_at) {
          const date = new Date(draft.scheduled_at)
          setScheduledDate(date)
          setScheduledTime(`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`)
        } else {
          setScheduledDate(undefined)
          setScheduledTime("09:00")
        }
      }
    }
  }, [searchParams, drafts])

  const handleNewPost = () => {
    setEditorState({
      content: "",
      tone: "professional",
      isGenerating: false,
      postImage: null,
      isGeneratingImage: false,
    })
    setScheduledDate(undefined)
    setScheduledTime("09:00")
    setCurrentDraftId(null)
    router.push("/content-lab")
  }

  const handleDraftFromTrend = async (trend: Trend) => {
    const tone = editorState.tone

    setEditorState((prev) => ({ ...prev, isGenerating: true }))

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "draft",
          tone,
          trend,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate draft")
      }

      const data = await response.json()
      setEditorState((prev) => ({
        ...prev,
        content: data.content || "",
        isGenerating: false,
      }))
      setCurrentDraftId(null)
    } catch (error) {
      console.error("Failed to generate draft:", error)
      setEditorState((prev) => ({ ...prev, isGenerating: false }))
    }
  }

  const handleLoadDraft = (draft: {
    id: string
    content: string
    tone: Tone
    image_url: string | null
    scheduled_at: string | null
  }) => {
    setEditorState((prev) => ({
      ...prev,
      content: draft.content || "",
      tone: draft.tone || "professional",
      postImage: draft.image_url || null,
    }))
    setCurrentDraftId(draft.id)
    if (draft.scheduled_at) {
      const date = new Date(draft.scheduled_at)
      setScheduledDate(date)
      setScheduledTime(`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`)
    } else {
      setScheduledDate(undefined)
      setScheduledTime("09:00")
    }
    setIsDraftsPanelOpen(false)
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <Sidebar onNewPost={handleNewPost} onOpenDrafts={() => setIsDraftsPanelOpen(true)} />

      <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-24 md:ml-64 md:pt-0">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-36 left-[-7rem] h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-1/3 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <Badge variant="secondary" className="gap-2 bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI studio
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Content Lab
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Turn trends into polished posts, then schedule them without leaving the workspace.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="gap-2" onClick={handleNewPost}>
                    <PenLine className="h-4 w-4" />
                    New post
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 bg-background/70"
                    onClick={() => setIsDraftsPanelOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                    View drafts
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend Discovery */}
          <div className="mt-8">
            <TrendDiscovery onDraftPost={handleDraftFromTrend} isGenerating={editorState.isGenerating} />
          </div>

          {/* AI Workspace - Pass editorState and handler functions */}
          <div className="mt-8">
            <AIWorkspace
              editorState={editorState}
              onContentChange={(content) => setEditorState((prev) => ({ ...prev, content }))}
              onToneChange={(tone) => setEditorState((prev) => ({ ...prev, tone: tone as Tone }))}
              onGeneratingChange={(isGenerating) => setEditorState((prev) => ({ ...prev, isGenerating }))}
              onImageChange={(postImage) => setEditorState((prev) => ({ ...prev, postImage }))}
              onImageGeneratingChange={(isGeneratingImage) => setEditorState((prev) => ({
                ...prev,
                isGeneratingImage,
              }))}
            />
          </div>
        </div>
      </main>

      {/* Scheduling Bar */}
      <SchedulingBar
        content={editorState.content}
        tone={editorState.tone}
        imageUrl={editorState.postImage}
        scheduledDate={scheduledDate}
        scheduledTime={scheduledTime}
        currentDraftId={currentDraftId}
        onScheduledDateChange={setScheduledDate}
        onScheduledTimeChange={setScheduledTime}
        onDraftIdChange={(id) => setCurrentDraftId(id)}
        onPublished={() => {
          handleNewPost()
        }}
      />

      {/* Drafts Panel */}
      <DraftsPanel
        isOpen={isDraftsPanelOpen}
        onClose={() => setIsDraftsPanelOpen(false)}
        onLoadDraft={handleLoadDraft}
      />
    </div>
  )
}

export default function ContentLabPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ContentLabContent />
    </Suspense>
  )
}
