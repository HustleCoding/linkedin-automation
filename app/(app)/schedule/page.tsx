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
import { ChevronLeft, ChevronRight, CalendarIcon, List, ImageIcon, Clock } from "lucide-react"

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
    return scheduledDrafts.filter((draft) => {
      const draftDate = new Date(draft.scheduled_at!)
      return (
        draftDate.getDate() === day &&
        draftDate.getMonth() === currentDate.getMonth() &&
        draftDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
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
  weekEnd.setDate(weekEnd.getDate() + 7)

  const todayCount = scheduledDrafts.filter((d) => {
    const scheduled = new Date(d.scheduled_at!)
    return scheduled >= todayStart && scheduled <= todayEnd
  }).length

  const weekCount = scheduledDrafts.filter((d) => {
    const scheduled = new Date(d.scheduled_at!)
    return scheduled >= todayStart && scheduled <= weekEnd
  }).length

  const withImageCount = scheduledDrafts.filter((d) => d.image_url).length

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 pb-8 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
              <p className="text-muted-foreground">Manage your upcoming LinkedIn posts</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="mr-1 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="mr-1 h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{scheduledDrafts.length}</p>
                <p className="text-sm text-muted-foreground">Total Scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary">{todayCount}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{weekCount}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{withImageCount}</p>
                <p className="text-sm text-muted-foreground">With Images</p>
              </CardContent>
            </Card>
          </div>

          {viewMode === "calendar" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground sm:text-sm">
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
                        className={`min-h-[80px] rounded-lg border p-1 sm:min-h-[100px] sm:p-2 ${
                          dayIsToday ? "border-primary bg-primary/5" : "border-border bg-card"
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
                              <div className="cursor-pointer truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary hover:bg-primary/20 sm:text-xs">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Scheduled Posts</CardTitle>
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
                    {scheduledDrafts
                      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
                      .map((draft) => (
                        <Link key={draft.id} href={`/content-lab?draft=${draft.id}`}>
                          <div className="group cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm text-foreground">{draft.content || "Empty draft"}</p>
                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(draft.scheduled_at!).toLocaleString()}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
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
