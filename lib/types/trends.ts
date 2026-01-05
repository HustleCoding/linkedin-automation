export interface Trend {
  id: string
  tag: string
  title: string
  reason: string
  viralScore: number
  category: string
}

export const NICHES = [
  "All Niches",
  "Technology",
  "Leadership",
  "Career",
  "Entrepreneurship",
  "Sales",
  "Marketing",
] as const

export type Niche = (typeof NICHES)[number]
