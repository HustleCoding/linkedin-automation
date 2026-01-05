"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TrendDiscovery } from "@/components/content-lab/trend-discovery"
import { AIWorkspace } from "@/components/content-lab/ai-workspace"
import { SchedulingBar } from "@/components/content-lab/scheduling-bar"
import { DraftsPanel } from "@/components/content-lab/drafts-panel"
import { createBrowserClient } from "@/lib/supabase/client"
import { useDrafts } from "@/hooks/use-drafts"
import type { Tone } from "@/lib/types/draft"
import type { Trend } from "@/lib/types/trends"

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
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <Sidebar onNewPost={handleNewPost} onOpenDrafts={() => setIsDraftsPanelOpen(true)} />

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-24 sm:pb-20 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Content Lab</h1>
            <p className="text-sm text-muted-foreground">Create, optimize, and schedule your LinkedIn content</p>
          </div>

          {/* Trend Discovery */}
          <TrendDiscovery onDraftPost={handleDraftFromTrend} isGenerating={editorState.isGenerating} />

          {/* AI Workspace - Pass editorState and handler functions */}
          <AIWorkspace
            editorState={editorState}
            onContentChange={(content) => setEditorState((prev) => ({ ...prev, content }))}
            onToneChange={(tone) => setEditorState((prev) => ({ ...prev, tone: tone as Tone }))}
            onGeneratingChange={(isGenerating) => setEditorState((prev) => ({ ...prev, isGenerating }))}
            onImageChange={(postImage) => setEditorState((prev) => ({ ...prev, postImage }))}
            onImageGeneratingChange={(isGeneratingImage) => setEditorState((prev) => ({ ...prev, isGeneratingImage }))}
          />
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
