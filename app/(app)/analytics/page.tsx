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
} from "lucide-react"
import { useDrafts } from "@/hooks/use-drafts"
import { formatDistanceToNow } from "date-fns"

interface PostAnalytics {
  impressions?: number
  clicks?: number
  likes?: number
  comments?: number
  shares?: number
  engagement?: number
  engagementRate?: number
}

interface PublishedPost {
  id: string
  content: string
  tone: string
  image_url: string | null
  published_at: string
  linkedin_post_id: string
  analytics: PostAnalytics | null
}

interface SocialAnalytics {
  followers?: number
  following?: number
  posts?: number
  engagement?: number
  impressions?: number
}

function AnalyticsContent() {
  const { drafts } = useDrafts()
  const [isLoading, setIsLoading] = useState(true)

  const publishedPosts = drafts.filter((d) => d.status === "published")
  const publishedCount = publishedPosts.length
  const scheduledCount = drafts.filter((d) => d.status === "scheduled").length
  const draftCount = drafts.filter((d) => d.status === "draft").length
  const postsWithImages = drafts.filter((d) => d.image_url).length

  useEffect(() => {
    // Simulate loading for smoother UX
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 pb-24">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">Track your LinkedIn content performance</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // Placeholder for fetch functions if needed in future
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Drafts</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{draftCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{scheduledCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Published</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{publishedCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">With Images</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{postsWithImages}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Published Posts List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Published Posts
              </CardTitle>
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
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      {/* Post Preview */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">
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
                            <Badge variant="default" className="text-xs bg-[#0A66C2]">
                              Posted to LinkedIn
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Placeholder Analytics */}
                      <div className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5" title="Upgrade to see impressions">
                          <Eye className="h-4 w-4" />
                          <span>—</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Upgrade to see likes">
                          <Heart className="h-4 w-4" />
                          <span>—</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Upgrade to see comments">
                          <MessageCircle className="h-4 w-4" />
                          <span>—</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Upgrade to see shares">
                          <Share2 className="h-4 w-4" />
                          <span>—</span>
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
