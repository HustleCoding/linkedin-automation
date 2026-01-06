import type { Tone } from "@/lib/types/draft"

export interface EditorState {
  content: string
  tone: Tone
  isGenerating: boolean
  postImage: string | null
  isGeneratingImage: boolean
}
