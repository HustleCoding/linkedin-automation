"use client"

import { Suspense, useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  RefreshCw,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { useDrafts } from "@/hooks/use-drafts"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

const formatMetric = (value?: number | null) => (typeof value === "number" ? value.toLocaleString() : "-")

function AnalyticsContent() {
  const { drafts, refresh } = useDrafts()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingList, setIsRefreshingList] = useState(false)
  const [refreshingPostId, setRefreshingPostId] = useState<string | null>(null)
  const { toast } = useToast()

  const publishedPosts = drafts.filter((d) => d.status === "published")
  const publishedCount = publishedPosts.length
  const scheduledCount = drafts.filter((d) => d.status === "scheduled").length
  const draftCount = drafts.filter((d) => d.status === "draft").length
  const postsWithImages = drafts.filter((d) => d.image_url).length

  const heroHighlights = [
    {
      label: "Published posts",
      value: publishedCount,
      helper: "All-time output",
      tone: "text-primary",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      helper: "Upcoming",
      tone: "text-foreground",
    },
    {
      label: "Drafts",
      value: draftCount,
      helper: "In progress",
      tone: "text-foreground",
    },
  ]

  const statCards = [
    {
      label: "Total Drafts",
      value: draftCount,
      helper: "In your workspace",
      icon: FileText,
      color: "bg-muted text-foreground",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      helper: "Queued to publish",
      icon: Calendar,
      color: "bg-muted text-foreground",
    },
    {
      label: "Published",
      value: publishedCount,
      helper: "Live on LinkedIn",
      icon: TrendingUp,
      color: "bg-muted text-foreground",
    },
    {
      label: "With Images",
      value: postsWithImages,
      helper: "Visual posts",
      icon: BarChart3,
      color: "bg-muted text-foreground",
    },
  ]

  useEffect(() => {
    // Simulate loading for smoother UX
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleRefreshList = async () => {
    setIsRefreshingList(true)
    await refresh()
    setIsRefreshingList(false)
  }

  const handleRefreshPost = async (draftId: string) => {
    setRefreshingPostId(draftId)
    try {
      const res = await fetch("/api/analytics/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to refresh analytics")
      }

      await refresh()
    } catch (error) {
      toast({
        title: "Analytics refresh failed",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      })
    } finally {
      setRefreshingPostId(null)
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar />

      <main className="relative flex-1 overflow-y-auto pt-16 pb-10 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <Badge variant="secondary" className="gap-2 bg-muted text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Performance snapshot
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Analytics</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Track how your LinkedIn content performs and spot what drives engagement.
                </p>
                <Button
                  variant="outline"
                  onClick={handleRefreshList}
                  className="mt-5 gap-2 bg-transparent"
                  disabled={isRefreshingList}
                >
                  {isRefreshingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh list
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/60 bg-card p-4">
                    <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="border-border/60 bg-card">
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

          {/* Published Posts List */}
          <Card className="mt-8 border-border/60 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Published Posts
              </CardTitle>
              <p className="text-sm text-muted-foreground">Each post is ready for deeper insights.</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : publishedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No published posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Publish your first post to LinkedIn to see it here
                  </p>
                  <Button asChild>
                    <a href="/content-lab">Create Post</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/40 p-4 transition-colors hover:border-foreground/20 hover:bg-muted/60 sm:flex-row"
                    >
                      {/* Post Preview */}
                      <div className="flex-1 min-w-0">
                        <p className="mb-2 line-clamp-2 text-sm font-medium text-foreground">{post.content}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">
                            {post.tone}
                          </Badge>
                          {post.published_at && (
                            <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                          )}
                          {post.image_url && (
                            <Badge variant="secondary" className="text-xs">
                              Has image
                            </Badge>
                          )}
                          {post.linkedin_post_id && (
                            <Badge variant="default" className="bg-primary text-xs">
                              Posted to LinkedIn
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:items-end">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="flex items-center gap-1.5" title="Impressions">
                            <Eye className="h-4 w-4" />
                            <span>{formatMetric(post.analytics_impressions)}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Likes">
                            <Heart className="h-4 w-4" />
                            <span>{formatMetric(post.analytics_likes)}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Comments">
                            <MessageCircle className="h-4 w-4" />
                            <span>{formatMetric(post.analytics_comments)}</span>
                          </div>
                          <div className="flex items-center gap-1.5" title="Shares">
                            <Share2 className="h-4 w-4" />
                            <span>{formatMetric(post.analytics_shares)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {post.last_analytics_synced_at ? (
                            <span>
                              Updated{" "}
                              {formatDistanceToNow(new Date(post.last_analytics_synced_at), { addSuffix: true })}
                            </span>
                          ) : (
                            <span>Not synced yet</span>
                          )}
                          {post.analytics_error && (
                            <span className="flex items-center gap-1 text-destructive" title={post.analytics_error}>
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="max-w-[220px] truncate">{post.analytics_error}</span>
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-2 px-2"
                            onClick={() => handleRefreshPost(post.id)}
                            disabled={refreshingPostId === post.id}
                          >
                            {refreshingPostId === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  )
}
