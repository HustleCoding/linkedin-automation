"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDrafts } from "@/hooks/use-drafts"
import { createBrowserClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, CalendarIcon, List, ImageIcon, Clock, TrendingUp, Sparkles } from "lucide-react"

export default function SchedulePage() {
  const router = useRouter()
  const { drafts, isLoading } = useDrafts()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
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

  const scheduledDrafts = drafts?.filter((d) => d.status === "scheduled" && d.scheduled_at) || []
  const sortedScheduledDrafts = [...scheduledDrafts].sort(
    (a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime(),
  )

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const getPostsForDay = (day: number) => {
    return sortedScheduledDrafts.filter((draft) => {
      const draftDate = new Date(draft.scheduled_at!)
      return (
        draftDate.getDate() === day &&
        draftDate.getMonth() === currentDate.getMonth() &&
        draftDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const today = new Date()
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  // Stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const todayCount = scheduledDrafts.filter((d) => {
    const scheduled = new Date(d.scheduled_at!)
    return scheduled >= todayStart && scheduled <= todayEnd
  }).length

  const weekCount = scheduledDrafts.filter((d) => {
    const scheduled = new Date(d.scheduled_at!)
    return scheduled >= todayStart && scheduled <= weekEnd
  }).length

  const withImageCount = scheduledDrafts.filter((d) => d.image_url).length

  const statCards = [
    {
      label: "Scheduled",
      value: scheduledDrafts.length,
      helper: "Total queued",
      icon: CalendarIcon,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Today",
      value: todayCount,
      helper: "Going live today",
      icon: Clock,
      color: "bg-emerald-500/10 text-emerald-700",
    },
    {
      label: "This Week",
      value: weekCount,
      helper: "Next 7 days",
      icon: TrendingUp,
      color: "bg-sky-500/10 text-sky-700",
    },
    {
      label: "With Images",
      value: withImageCount,
      helper: "Visual posts",
      icon: ImageIcon,
      color: "bg-amber-500/10 text-amber-700",
    },
  ]

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar />

      <main className="relative flex-1 overflow-y-auto pt-16 pb-10 md:ml-64 md:pt-0">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-[-6rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 left-[-7rem] h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <Badge variant="secondary" className="gap-2 bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Scheduling overview
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Schedule</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Plan your LinkedIn cadence and keep your content calendar balanced.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/70 p-2">
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="mr-1 h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="border-border/70 bg-card/80 shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.helper}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {viewMode === "calendar" ? (
            <Card className="mt-8 border-border/70 bg-card/80 shadow-sm">
              <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{monthLabel}</CardTitle>
                  <p className="text-sm text-muted-foreground">See every post scheduled this month.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-background/60" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" className="bg-background/60" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-background/60" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the first */}
                  {Array.from({ length: startingDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px]" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const posts = getPostsForDay(day)
                    const dayIsToday = isToday(day)

                    return (
                      <div
                        key={day}
                        className={`min-h-[80px] rounded-xl border p-1 transition-colors sm:min-h-[110px] sm:p-2 ${
                          dayIsToday
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/60 bg-background/60 hover:bg-background/90"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium sm:text-sm ${
                            dayIsToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {posts.slice(0, 2).map((post) => (
                            <Link key={post.id} href={`/content-lab?draft=${post.id}`}>
                              <div className="cursor-pointer truncate rounded-md bg-primary/10 px-1 py-0.5 text-[10px] text-primary transition-colors hover:bg-primary/20 sm:text-xs">
                                {new Date(post.scheduled_at!).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </Link>
                          ))}
                          {posts.length > 2 && (
                            <div className="text-[10px] text-muted-foreground sm:text-xs">+{posts.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-8 border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Scheduled Posts</CardTitle>
                <p className="text-sm text-muted-foreground">Every post ready to go live.</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : scheduledDrafts.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No scheduled posts yet</p>
                    <Link href="/content-lab">
                      <Button variant="link" className="mt-2 text-primary">
                        Create your first post
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedScheduledDrafts.map((draft) => (
                      <Link key={draft.id} href={`/content-lab?draft=${draft.id}`}>
                        <div className="group cursor-pointer rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background/90">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-foreground">
                                {draft.content || "Empty draft"}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(draft.scheduled_at!).toLocaleString()}
                                </span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {draft.tone}
                                </Badge>
                                {draft.image_url && (
                                  <span className="flex items-center gap-1">
                                    <ImageIcon className="h-3 w-3" />
                                    Image
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
