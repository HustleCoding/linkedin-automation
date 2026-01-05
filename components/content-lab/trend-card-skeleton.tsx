import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TrendCardSkeleton() {
  return (
    <Card className="min-w-[200px] max-w-[200px] sm:min-w-[240px] sm:max-w-[240px] flex-shrink-0">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mb-1 h-4 w-28" />
        <Skeleton className="mb-3 sm:mb-4 h-8 w-full" />
        <Skeleton className="h-7 sm:h-8 w-full" />
      </CardContent>
    </Card>
  )
}
