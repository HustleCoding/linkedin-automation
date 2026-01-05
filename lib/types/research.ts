export interface ResearchResult {
  overview: string
  keyInsights: Array<{
    title: string
    description: string
    relevance: "high" | "medium" | "low"
  }>
  contentAngles: Array<{
    angle: string
    hook: string
    format: "story" | "listicle" | "how-to" | "opinion" | "case-study"
  }>
  hashtags: string[]
  audienceInsights: {
    primaryAudience: string
    painPoints: string[]
    motivations: string[]
  }
  trendingQuestions: string[]
}

export interface CompetitorAnalysis {
  profile: {
    name: string
    headline: string
    estimatedFollowers: string
    niche: string
    postingFrequency: string
  }
  contentStrategy: {
    primaryThemes: string[]
    contentFormats: string[]
    toneOfVoice: string
    uniqueApproach: string
  }
  topPerformingContent: Array<{
    type: string
    topic: string
    whyItWorks: string
  }>
  lessonsToLearn: string[]
  gaps: string[]
}

export type ResearchHistoryKind = "topic" | "competitor"

export interface ResearchHistoryItem {
  id: string
  user_id: string
  kind: ResearchHistoryKind
  query: string
  depth: string | null
  result: ResearchResult | CompetitorAnalysis
  created_at: string
}
