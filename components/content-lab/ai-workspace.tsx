"use client"

import { PostEditor } from "./post-editor"
import { LinkedInPreview } from "./linkedin-preview"
import type { EditorState } from "@/app/page"

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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6 overflow-hidden min-w-0">
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
