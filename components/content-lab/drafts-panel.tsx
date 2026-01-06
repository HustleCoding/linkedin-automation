"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Calendar, Clock, Trash2, X, ImageIcon } from "lucide-react"
import { useDrafts } from "@/hooks/use-drafts"
import type { Draft } from "@/lib/types/draft"

interface DraftsPanelProps {
  isOpen: boolean
  onClose: () => void
  onLoadDraft: (draft: Draft) => void
  currentDraftId: string | null
}

export function DraftsPanel({ isOpen, onClose, onLoadDraft, currentDraftId }: DraftsPanelProps) {
  const { drafts, isLoading, deleteDraft } = useDrafts()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteDraft(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + "..."
  }

  const getStatusColor = (status: Draft["status"]) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground"
      case "scheduled":
        return "bg-primary/10 text-primary"
      case "published":
        return "bg-green-500/10 text-green-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 lg:bg-transparent"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-border/60 bg-background shadow-[0_16px_32px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Your Drafts</h2>
              <p className="text-sm text-muted-foreground">
                {drafts.length} {drafts.length === 1 ? "draft" : "drafts"} saved
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Drafts List */}
          <ScrollArea className="flex-1 min-h-0 overscroll-contain">
            <div className="p-4 space-y-3">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border p-4 animate-pulse">
                    <div className="h-4 w-24 bg-muted rounded mb-3" />
                    <div className="h-3 w-full bg-muted rounded mb-2" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                ))
              ) : drafts.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No drafts yet</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Save your posts as drafts to continue editing them later
                  </p>
                </div>
              ) : (
                // Drafts list
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={cn(
                      "group relative rounded-lg border border-border/60 p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50 cursor-pointer",
                      currentDraftId === draft.id && "border-foreground/30 bg-muted/50",
                    )}
                    onClick={() => onLoadDraft(draft)}
                  >
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={cn("text-xs capitalize", getStatusColor(draft.status))}>
                        {draft.status}
                      </Badge>
                      {draft.image_url && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Image
                        </Badge>
                      )}
                    </div>

                    {/* Content preview */}
                    <p className="text-sm text-foreground mb-3 line-clamp-2">
                      {draft.content ? truncateContent(draft.content) : "Empty draft"}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(draft.updated_at)}
                      </span>
                      {draft.scheduled_at && (
                        <span className="flex items-center gap-1 text-primary">
                          <Calendar className="h-3 w-3" />
                          {formatDate(draft.scheduled_at)}
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(draft.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This draft will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
