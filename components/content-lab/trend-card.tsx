"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trend } from "@/lib/types/trends"

interface TrendCardProps {
  trend: Trend
  onDraftPost: (trend: Trend) => void
  isGenerating: boolean
}

export function TrendCard({ trend, onDraftPost, isGenerating }: TrendCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    if (score >= 80) return "text-primary bg-primary/10 border-primary/20"
    return "text-amber-600 bg-amber-500/10 border-amber-500/20"
  }

  const isHot = trend.viralScore >= 90

  return (
    <Card
      className={cn(
        "min-w-[200px] max-w-[200px] sm:min-w-[240px] sm:max-w-[240px] flex-shrink-0 transition-all hover:shadow-md hover:-translate-y-0.5",
        isHot && "ring-1 ring-emerald-500/20",
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
            {trend.category}
          </Badge>
          <div
            className={cn(
              "flex items-center gap-0.5 sm:gap-1 rounded-full border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium",
              getScoreColor(trend.viralScore),
            )}
          >
            {isHot ? <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {trend.viralScore}%
          </div>
        </div>

        <h3 className="mb-0.5 font-semibold text-foreground text-xs sm:text-sm">{trend.tag}</h3>
        <p className="mb-1 text-[10px] sm:text-xs text-muted-foreground/80 line-clamp-1">{trend.title}</p>
        <p className="mb-3 sm:mb-4 text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {trend.reason}
        </p>

        <Button
          size="sm"
          onClick={() => onDraftPost(trend)}
          disabled={isGenerating}
          className="w-full h-7 sm:h-8 text-[10px] sm:text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            "Draft Post"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
