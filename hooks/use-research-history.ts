"use client"

import useSWR from "swr"
import type { ResearchHistoryItem } from "@/lib/types/research"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useResearchHistory() {
  const { data, error, isLoading, mutate } = useSWR<{ history: ResearchHistoryItem[] }>("/api/research/history", fetcher)

  return {
    history: data?.history || [],
    isLoading,
    error,
    refresh: mutate,
  }
}
