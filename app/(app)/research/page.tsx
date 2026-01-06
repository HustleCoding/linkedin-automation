"use client"

import { Suspense, useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  Hash,
  HelpCircle,
  History,
  Target,
  BookOpen,
  UserSearch,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useResearchHistory } from "@/hooks/use-research-history"
import type { CompetitorAnalysis, ResearchResult } from "@/lib/types/research"

const formatHistoryTimestamp = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function ResearchContent() {
  const [activeTab, setActiveTab] = useState("topic")
  const [topicQuery, setTopicQuery] = useState("")
  const [competitorQuery, setCompetitorQuery] = useState("")
  const [isResearching, setIsResearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null)
  const [competitorResult, setCompetitorResult] = useState<CompetitorAnalysis | null>(null)
  const [copiedHook, setCopiedHook] = useState<string | null>(null)
  const { toast } = useToast()
  const { history, isLoading: isHistoryLoading, refresh: refreshHistory } = useResearchHistory()
  const topicHistory = history.filter((item) => item.kind === "topic")
  const competitorHistory = history.filter((item) => item.kind === "competitor")

  useEffect(() => {
    if (!researchResult && topicHistory.length > 0) {
      const latest = topicHistory[0]
      setResearchResult(latest.result as ResearchResult)
      setTopicQuery(latest.query)
    }
  }, [researchResult, topicHistory])

  useEffect(() => {
    if (!competitorResult && competitorHistory.length > 0) {
      const latest = competitorHistory[0]
      setCompetitorResult(latest.result as CompetitorAnalysis)
      setCompetitorQuery(latest.query)
    }
  }, [competitorResult, competitorHistory])

  const handleTopicResearch = async () => {
    if (!topicQuery.trim()) return
    setIsResearching(true)
    setResearchResult(null)
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicQuery, depth: "standard" }),
      })
      if (!response.ok) throw new Error("Research failed")
      const data = await response.json()
      setResearchResult(data.research)
      refreshHistory()
    } catch {
      toast({
        title: "Research failed",
        description: "Could not research this topic. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleCompetitorAnalysis = async () => {
    if (!competitorQuery.trim()) return
    setIsAnalyzing(true)
    setCompetitorResult(null)
    try {
      const response = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: competitorQuery }),
      })
      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      setCompetitorResult(data.analysis)
      refreshHistory()
    } catch {
      toast({
        title: "Analysis failed",
        description: "Could not analyze this profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyHook = (hook: string) => {
    navigator.clipboard.writeText(hook)
    setCopiedHook(hook)
    setTimeout(() => setCopiedHook(null), 2000)
    toast({ title: "Hook copied!", description: "Paste it in Content Lab to start writing." })
  }

  const relevanceColor = (relevance: string) => {
    switch (relevance) {
      case "high":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20"
    }
  }

  const formatIcon = (format: string) => {
    switch (format) {
      case "story":
        return "📖"
      case "listicle":
        return "📝"
      case "how-to":
        return "🛠️"
      case "opinion":
        return "💭"
      case "case-study":
        return "📊"
      default:
        return "✍️"
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-10 md:ml-64 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Research</h1>
            <p className="mt-1 text-muted-foreground">
              Deep-dive into topics and analyze competitors to fuel your content strategy
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 min-w-0">
            <TabsList className="grid w-full max-w-md grid-cols-1 gap-1 h-auto sm:grid-cols-2 sm:h-9">
              <TabsTrigger value="topic" className="gap-2 whitespace-normal text-center sm:whitespace-nowrap">
                <BookOpen className="h-4 w-4" />
                Topic Research
              </TabsTrigger>
              <TabsTrigger value="competitor" className="gap-2 whitespace-normal text-center sm:whitespace-nowrap">
                <UserSearch className="h-4 w-4" />
                Competitor Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topic" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter a topic to research (e.g., AI in marketing, remote work trends)"
                        value={topicQuery}
                        onChange={(e) => setTopicQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleTopicResearch()}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleTopicResearch}
                      disabled={isResearching || !topicQuery.trim()}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 sm:w-auto"
                    >
                      {isResearching ? (
                        <>
                          <Sparkles className="h-4 w-4 animate-spin" />
                          Researching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Research Topic
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Research History
                  </CardTitle>
                  <CardDescription>Reopen any of your past topic research runs</CardDescription>
                </CardHeader>
                <CardContent>
                  {isHistoryLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : topicHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved topics yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {topicHistory.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setResearchResult(item.result as ResearchResult)
                            setTopicQuery(item.query)
                          }}
                          className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/50"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground truncate">{item.query}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {formatHistoryTimestamp(item.created_at)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-primary shrink-0">View</span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isResearching && (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-32" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {researchResult && !isResearching && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Topic Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                        {researchResult.overview}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {researchResult.keyInsights.map((insight, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground break-words">{insight.title}</span>
                              <Badge variant="outline" className={relevanceColor(insight.relevance)}>
                                {insight.relevance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground break-words">{insight.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Audience Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Primary Audience</p>
                          <p className="text-sm text-muted-foreground">
                            {researchResult.audienceInsights.primaryAudience}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Pain Points</p>
                          <div className="flex flex-wrap gap-2">
                            {researchResult.audienceInsights.painPoints.map((point, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="bg-red-500/10 text-red-600 border-red-500/20 max-w-full whitespace-normal"
                              >
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Motivations</p>
                          <div className="flex flex-wrap gap-2">
                            {researchResult.audienceInsights.motivations.map((motivation, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="bg-green-500/10 text-green-600 border-green-500/20 max-w-full whitespace-normal"
                              >
                                {motivation}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          Content Angles & Hooks
                        </CardTitle>
                        <CardDescription>Ready-to-use hooks you can start writing from</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {researchResult.contentAngles.map((angle, i) => (
                            <div
                              key={i}
                              className="group relative rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{formatIcon(angle.format)}</span>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {angle.format}
                                </Badge>
                              </div>
                              <p className="font-medium text-foreground mb-2 break-words">{angle.angle}</p>
                              <p className="text-sm text-muted-foreground italic mb-3 break-words">"{angle.hook}"</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1 text-xs"
                                onClick={() => copyHook(angle.hook)}
                              >
                                {copiedHook === angle.hook ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy Hook
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5 text-sky-500" />
                          Relevant Hashtags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {researchResult.hashtags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(tag)
                                toast({ title: "Copied!", description: tag })
                              }}
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-orange-500" />
                          Trending Questions
                        </CardTitle>
                        <CardDescription>Questions your audience is asking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {researchResult.trendingQuestions.map((question, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary font-medium">Q:</span>
                              <span className="text-muted-foreground break-words">{question}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {!isResearching && !researchResult && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Research</h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter any topic above to get AI-powered insights, content angles, and audience analysis
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="competitor" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter a LinkedIn thought leader's name (e.g., Justin Welsh, Alex Hormozi)"
                        value={competitorQuery}
                        onChange={(e) => setCompetitorQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCompetitorAnalysis()}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleCompetitorAnalysis}
                      disabled={isAnalyzing || !competitorQuery.trim()}
                      className="w-full gap-2 bg-primary hover:bg-primary/90 sm:w-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Analyze Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Competitor History
                  </CardTitle>
                  <CardDescription>Jump back into a previous competitor analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {isHistoryLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : competitorHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved competitors yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {competitorHistory.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCompetitorResult(item.result as CompetitorAnalysis)
                            setCompetitorQuery(item.query)
                          }}
                          className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/50"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground truncate">{item.query}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {formatHistoryTimestamp(item.created_at)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-primary shrink-0">View</span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isAnalyzing && (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-32" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {competitorResult && !isAnalyzing && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Profile Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold">
                          {competitorResult.profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold text-foreground break-words">
                            {competitorResult.profile.name}
                          </h3>
                          <p className="text-muted-foreground break-words">{competitorResult.profile.headline}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <Badge variant="secondary" className="max-w-full whitespace-normal">
                              {competitorResult.profile.estimatedFollowers} followers
                            </Badge>
                            <Badge variant="outline" className="max-w-full whitespace-normal">
                              {competitorResult.profile.niche}
                            </Badge>
                            <Badge variant="outline" className="max-w-full whitespace-normal">
                              {competitorResult.profile.postingFrequency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          Content Strategy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Primary Themes</p>
                          <div className="flex flex-wrap gap-2">
                            {competitorResult.contentStrategy.primaryThemes.map((theme, i) => (
                              <Badge key={i} variant="secondary" className="max-w-full whitespace-normal">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Content Formats</p>
                          <div className="flex flex-wrap gap-2">
                            {competitorResult.contentStrategy.contentFormats.map((format, i) => (
                              <Badge key={i} variant="outline" className="max-w-full whitespace-normal">
                                {format}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Tone of Voice</p>
                          <p className="text-sm text-muted-foreground">
                            {competitorResult.contentStrategy.toneOfVoice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Unique Approach</p>
                          <p className="text-sm text-muted-foreground">
                            {competitorResult.contentStrategy.uniqueApproach}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Top Performing Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {competitorResult.topPerformingContent.map((content, i) => (
                          <div key={i} className="border-l-2 border-primary/50 pl-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {content.type}
                              </Badge>
                            </div>
                            <p className="font-medium text-foreground text-sm">{content.topic}</p>
                            <p className="text-xs text-muted-foreground mt-1">{content.whyItWorks}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          Lessons to Learn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {competitorResult.lessonsToLearn.map((lesson, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span className="text-sm text-muted-foreground">{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-orange-500" />
                          Gaps & Opportunities
                        </CardTitle>
                        <CardDescription>Areas you could capitalize on</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {competitorResult.gaps.map((gap, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                              <span className="text-sm text-muted-foreground">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {!isAnalyzing && !competitorResult && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <UserSearch className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analyze a Competitor</h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter a LinkedIn thought leader's name to analyze their content strategy and find opportunities
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function ResearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResearchContent />
    </Suspense>
  )
}
