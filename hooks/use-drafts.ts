"use client"

import useSWR from "swr"
import type { Draft, CreateDraftInput, UpdateDraftInput } from "@/lib/types/draft"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useDrafts() {
  const { data, error, isLoading, mutate } = useSWR<{ drafts: Draft[] }>("/api/drafts", fetcher)

  const createDraft = async (input: CreateDraftInput): Promise<Draft | null> => {
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create draft")
      }

      const { draft } = await res.json()
      mutate()
      return draft
    } catch (err) {
      console.error("Failed to create draft:", err)
      return null
    }
  }

  const updateDraft = async (input: UpdateDraftInput): Promise<Draft | null> => {
    try {
      const res = await fetch(`/api/drafts/${input.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update draft")
      }

      const { draft } = await res.json()
      mutate()
      return draft
    } catch (err) {
      console.error("Failed to update draft:", err)
      return null
    }
  }

  const deleteDraft = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete draft")
      }

      mutate()
      return true
    } catch (err) {
      console.error("Failed to delete draft:", err)
      return false
    }
  }

  return {
    drafts: data?.drafts || [],
    isLoading,
    error,
    createDraft,
    updateDraft,
    deleteDraft,
    refresh: mutate,
  }
}
