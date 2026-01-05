"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { useDrafts } from "@/hooks/use-drafts"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  PenLine,
  TrendingUp,
  Calendar,
  BarChart3,
  FileText,
  Clock,
  Send,
  ImageIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { drafts, isLoading } = useDrafts()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login")
      } else {
        setUser(data.user)
      }
    })
  }, [router])

  const draftCount = drafts?.filter((d) => d.status === "draft").length || 0
  const scheduledCount = drafts?.filter((d) => d.status === "scheduled").length || 0
  const publishedCount = drafts?.filter((d) => d.status === "published").length || 0
  const withImageCount = drafts?.filter((d) => d.image_url).length || 0

  const recentDrafts = drafts?.slice(0, 3) || []
  const upcomingScheduled =
    drafts
      ?.filter((d) => d.status === "scheduled" && d.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .slice(0, 3) || []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const todayCount =
    drafts?.filter((d) => {
      if (!d.scheduled_at) return false
      const scheduled = new Date(d.scheduled_at)
      return scheduled >= todayStart && scheduled <= todayEnd
    }).length || 0

  const weekCount =
    drafts?.filter((d) => {
      if (!d.scheduled_at) return false
      const scheduled = new Date(d.scheduled_at)
      return scheduled >= todayStart && scheduled <= weekEnd
    }).length || 0

  const quickActions = [
    {
      icon: PenLine,
      title: "New Post",
      description: "Create a new LinkedIn post",
      href: "/content-lab",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: TrendingUp,
      title: "Find Trends",
      description: "Discover trending topics",
      href: "/content-lab",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "View your content calendar",
      href: "/schedule",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your performance",
      href: "/analytics",
      color: "bg-sky-500/10 text-sky-600",
    },
  ]

  const heroHighlights = [
    {
      label: "Posts today",
      value: todayCount,
      helper: "Scheduled in next 24h",
      tone: "text-primary",
    },
    {
      label: "This week",
      value: weekCount,
      helper: "Upcoming schedule",
      tone: "text-foreground",
    },
    {
      label: "Queued",
      value: scheduledCount,
      helper: "Ready to publish",
      tone: "text-foreground",
    },
  ]

  const statCards = [
    {
      icon: FileText,
      label: "Drafts",
      value: draftCount,
      description: "Ideas in progress",
      color: "bg-slate-900/5 text-slate-700",
    },
    {
      icon: Clock,
      label: "Scheduled",
      value: scheduledCount,
      description: "Next up in queue",
      color: "bg-sky-500/10 text-sky-700",
    },
    {
      icon: Send,
      label: "Published",
      value: publishedCount,
      description: "Shared publicly",
      color: "bg-emerald-500/10 text-emerald-700",
    },
    {
      icon: ImageIcon,
      label: "With Images",
      value: withImageCount,
      description: "Visual posts",
      color: "bg-amber-500/10 text-amber-700",
    },
  ]

  const weeklySummary = [
    {
      label: "Posts Today",
      value: todayCount,
      helper: "Scheduled in the next 24h",
      tone: "text-primary",
    },
    {
      label: "Posts This Week",
      value: weekCount,
      helper: "Scheduled in the next 7 days",
      tone: "text-foreground",
    },
    {
      label: "In Progress",
      value: draftCount,
      helper: "Drafts being refined",
      tone: "text-foreground",
    },
    {
      label: "Published",
      value: publishedCount,
      helper: "Already live",
      tone: "text-foreground",
    },
  ]

  if (!user) {
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
          <div className="absolute -top-32 right-[-6rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-32 left-[-7rem] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="absolute bottom-[-10rem] right-1/4 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <Badge variant="secondary" className="gap-2 bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Weekly cadence
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Draft, refine, and schedule with a clear view of what ships today and what's next.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/content-lab">
                    <Button className="gap-2">
                      <PenLine className="h-4 w-4" />
                      New post
                    </Button>
                  </Link>
                  <Link href="/content-lab">
                    <Button variant="outline" className="gap-2 bg-background/60">
                      <TrendingUp className="h-4 w-4" />
                      Explore trends
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group relative cursor-pointer overflow-hidden border-border/70 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Snapshot */}
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
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="border-border/70 bg-card/80 shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Drafts</CardTitle>
                  <p className="text-sm text-muted-foreground">Pick up right where you left off.</p>
                </div>
                <Link href="/content-lab">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : recentDrafts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No drafts yet</p>
                    <Link href="/content-lab">
                      <Button variant="link" className="mt-2 text-primary">
                        Create your first post
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentDrafts.map((draft) => (
                    <Link key={draft.id} href={`/content-lab?draft=${draft.id}`} className="block">
                      <div className="group cursor-pointer rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background/90">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
                            {draft.content || "Empty draft"}
                          </p>
                          <Badge
                            variant={
                              draft.status === "published"
                                ? "default"
                                : draft.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0 text-xs capitalize"
                          >
                            {draft.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Updated {new Date(draft.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Upcoming Posts</CardTitle>
                    <p className="text-sm text-muted-foreground">Next on your calendar.</p>
                  </div>
                  <Link href="/schedule">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Calendar
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-5">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : upcomingScheduled.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No scheduled posts</p>
                      <Link href="/content-lab">
                        <Button variant="link" className="mt-2 text-primary">
                          Schedule a post
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    upcomingScheduled.map((draft) => (
                      <Link key={draft.id} href={`/content-lab?draft=${draft.id}`} className="block">
                        <div className="group cursor-pointer rounded-xl border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background/90">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
                              {draft.content || "Empty draft"}
                            </p>
                            {draft.image_url && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-primary">
                            {new Date(draft.scheduled_at!).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Weekly Rhythm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklySummary.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.helper}</p>
                      </div>
                      <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                    Keep a steady pace to build audience trust. Scheduling 3-5 posts per week keeps reach consistent.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
