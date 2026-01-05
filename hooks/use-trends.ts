"use client"

import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import type { Trend, Niche } from "@/lib/types/trends"

interface TrendsResponse {
  trends: Trend[]
}

const fetcher = async (url: string, niche: Niche, refresh = false): Promise<TrendsResponse> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ niche, refresh }),
  })

  if (!res.ok) {
    throw new Error("Failed to fetch trends")
  }

  return res.json()
}

export function useTrends(niche: Niche) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data, error, isLoading, mutate } = useSWRImmutable<TrendsResponse>(
    ["/api/trends", niche],
    ([url, niche]) => fetcher(url, niche),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  return {
    trends: data?.trends ?? [],
    isLoading,
    isRefreshing,
    isError: !!error,
    error,
    refresh: async () => {
      setIsRefreshing(true)
      try {
        await mutate(fetcher("/api/trends", niche, true), { revalidate: false })
      } catch (err) {
        console.error("Failed to refresh trends:", err)
      } finally {
        setIsRefreshing(false)
      }
    },
  }
}
