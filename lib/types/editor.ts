import type { Tone } from "@/lib/types/draft"

export type PostType = "how-to" | "teardown" | "checklist" | "case-study" | "contrarian" | "story"

export interface EditorState {
  content: string
  tone: Tone
  postType: PostType
  isGenerating: boolean
  postImage: string | null
  isGeneratingImage: boolean
}
