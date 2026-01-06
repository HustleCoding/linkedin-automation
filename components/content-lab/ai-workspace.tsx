"use client"

import { PostEditor } from "./post-editor"
import { LinkedInPreview } from "./linkedin-preview"
import type { EditorState } from "@/lib/types/editor"

interface AIWorkspaceProps {
  editorState: EditorState
  onContentChange: (content: string) => void
  onToneChange: (tone: string) => void
  onGeneratingChange: (generating: boolean) => void
  onImageChange: (image: string | null) => void
  onImageGeneratingChange: (generating: boolean) => void
}

export function AIWorkspace({
  editorState,
  onContentChange,
  onToneChange,
  onGeneratingChange,
  onImageChange,
  onImageGeneratingChange,
}: AIWorkspaceProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] lg:flex-row lg:gap-6 lg:p-6">
      {/* Editor Panel */}
      <div className="w-full min-w-0 lg:flex-1">
        <PostEditor
          content={editorState.content}
          tone={editorState.tone}
          isGenerating={editorState.isGenerating}
          postImage={editorState.postImage}
          isGeneratingImage={editorState.isGeneratingImage}
          onContentChange={onContentChange}
          onToneChange={onToneChange}
          onGenerate={onGeneratingChange}
          onImageChange={onImageChange}
          onImageGeneratingChange={onImageGeneratingChange}
        />
      </div>

      {/* Preview Panel */}
      <div className="w-full mx-auto max-w-sm lg:mx-0 lg:w-[380px] lg:max-w-none lg:flex-shrink-0">
        <LinkedInPreview
          content={editorState.content}
          isGenerating={editorState.isGenerating}
          postImage={editorState.postImage}
        />
      </div>
    </div>
  )
}
