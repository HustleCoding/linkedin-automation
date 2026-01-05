"use client"

import useSWR from "swr"
import type { Trend, Niche } from "@/lib/types/trends"

interface TrendsResponse {
  trends: Trend[]
}

const fetcher = async (url: string, niche: Niche): Promise<TrendsResponse> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ niche }),
  })

  if (!res.ok) {
    throw new Error("Failed to fetch trends")
  }

  return res.json()
}

export function useTrends(niche: Niche) {
  const { data, error, isLoading, mutate } = useSWR<TrendsResponse>(
    ["/api/trends", niche],
    ([url, niche]) => fetcher(url, niche),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    },
  )

  return {
    trends: data?.trends ?? [],
    isLoading,
    isError: !!error,
    error,
    refresh: () => mutate(),
  }
}
