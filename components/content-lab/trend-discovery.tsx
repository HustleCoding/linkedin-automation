"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, Flame, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react"
import { TrendCard } from "./trend-card"
import { TrendCardSkeleton } from "./trend-card-skeleton"
import { useTrends } from "@/hooks/use-trends"
import { NICHES, type Niche, type Trend } from "@/lib/types/trends"
import { cn } from "@/lib/utils"

interface TrendDiscoveryProps {
  onDraftPost: (trend: Trend) => void
  isGenerating: boolean
}

export function TrendDiscovery({ onDraftPost, isGenerating }: TrendDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNiche, setSelectedNiche] = useState<Niche>("All Niches")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { trends, isLoading, isRefreshing, isError, refresh } = useTrends(selectedNiche)
  const isBusy = isLoading || isRefreshing

  const filteredTrends = trends.filter((trend) => {
    const matchesSearch =
      trend.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener("scroll", checkScroll)
      return () => ref.removeEventListener("scroll", checkScroll)
    }
  }, [filteredTrends])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="border-b border-border px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      {/* Header */}
      <div className="mb-3 sm:mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="font-semibold text-foreground text-sm sm:text-base">Trending Topics</h2>
            <Badge variant="secondary" className="ml-1 text-[10px] sm:text-xs">
              <Flame className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-500" />
              Live
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            disabled={isBusy}
            className="h-7 sm:h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isBusy && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 pl-8 sm:pl-9 text-xs sm:text-sm"
            />
          </div>
          <Select value={selectedNiche} onValueChange={(v) => setSelectedNiche(v as Niche)}>
            <SelectTrigger className="h-8 sm:h-9 w-28 sm:w-36 text-xs sm:text-sm flex-shrink-0">
              <SelectValue placeholder="Niche" />
            </SelectTrigger>
            <SelectContent>
              {NICHES.map((niche) => (
                <SelectItem key={niche} value={niche} className="text-xs sm:text-sm">
                  {niche}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div className="relative -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">
        {/* Left scroll button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute left-1 sm:left-2 lg:left-4 top-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 rounded-full bg-background shadow-md transition-opacity hidden sm:flex",
            canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        {/* Left fade gradient */}
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-[5] h-full w-6 sm:w-8 bg-gradient-to-r from-background to-transparent transition-opacity",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />

        <div ref={scrollRef} className="scrollbar-hide flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {isLoading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TrendCardSkeleton key={i} />
              ))}
            </>
          )}

          {isError && !isLoading && (
            <div className="flex min-w-full items-center justify-center gap-2 py-8 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load trends.</span>
              <Button variant="link" size="sm" onClick={() => refresh()} className="text-primary">
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredTrends.length === 0 && (
            <div className="flex min-w-full items-center justify-center py-8 text-muted-foreground">
              <span className="text-sm">No trends found. Try a different search or niche.</span>
            </div>
          )}

          {!isLoading &&
            !isError &&
            filteredTrends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} onDraftPost={onDraftPost} isGenerating={isGenerating} />
            ))}
        </div>

        {/* Right fade gradient */}
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 z-[5] h-full w-6 sm:w-8 bg-gradient-to-l from-background to-transparent transition-opacity",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Right scroll button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute right-1 sm:right-2 lg:right-4 top-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 rounded-full bg-background shadow-md transition-opacity hidden sm:flex",
            canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </section>
  )
}
