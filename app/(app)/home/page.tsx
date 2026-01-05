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
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "View your content calendar",
      href: "/schedule",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your performance",
      href: "/analytics",
      color: "bg-violet-500/10 text-violet-500",
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 pb-8 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="mt-1 text-muted-foreground">Here's what's happening with your LinkedIn content</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
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

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scheduledCount}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Send className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{withImageCount}</p>
                  <p className="text-sm text-muted-foreground">With Images</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent & Upcoming */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Drafts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Recent Drafts</CardTitle>
                <Link href="/content-lab">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    <Link key={draft.id} href={`/content-lab?draft=${draft.id}`}>
                      <div className="group cursor-pointer rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 flex-1 text-sm text-foreground">
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
                            className="shrink-0 text-xs"
                          >
                            {draft.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(draft.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Scheduled */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Upcoming Posts</CardTitle>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View Calendar
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    <Link key={draft.id} href={`/content-lab?draft=${draft.id}`}>
                      <div className="group cursor-pointer rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 flex-1 text-sm text-foreground">
                            {draft.content || "Empty draft"}
                          </p>
                          {draft.image_url && <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        </div>
                        <p className="mt-1 text-xs text-primary">{new Date(draft.scheduled_at!).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* This Week Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{todayCount}</p>
                  <p className="text-sm text-muted-foreground">Posts Today</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{weekCount}</p>
                  <p className="text-sm text-muted-foreground">Posts This Week</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
