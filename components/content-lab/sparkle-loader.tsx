import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface SparkleLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SparkleLoader({ size = "md", className }: SparkleLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Sparkles className={cn(sizeClasses[size], "text-primary animate-sparkle")} />
      <Sparkles
        className={cn(sizeClasses[size], "text-primary/70 animate-sparkle-delay-1")}
        style={{ transform: "scale(0.8)" }}
      />
      <Sparkles
        className={cn(sizeClasses[size], "text-primary/50 animate-sparkle-delay-2")}
        style={{ transform: "scale(0.6)" }}
      />
    </div>
  )
}
