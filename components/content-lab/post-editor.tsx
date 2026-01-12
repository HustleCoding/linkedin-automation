"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PenLine, Lightbulb, Italic, List, Link2, ImagePlus, X, Palette, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostType } from "@/lib/types/editor"

interface PostEditorProps {
  content: string
  tone: string
  postType: PostType
  isGenerating: boolean
  postImage: string | null
  isGeneratingImage: boolean
  onContentChange: (content: string) => void
  onToneChange: (tone: string) => void
  onPostTypeChange: (postType: PostType) => void
  onGenerate: (generating: boolean) => void
  onImageChange: (image: string | null) => void
  onImageGeneratingChange: (generating: boolean) => void
}

const tones = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Casual" },
  { value: "inspirational", label: "Inspiring" },
  { value: "educational", label: "Educational" },
]

const imageStyles = [
  { value: "professional", label: "Professional", description: "Clean corporate look" },
  { value: "abstract", label: "Abstract", description: "Geometric & conceptual" },
  { value: "minimal", label: "Minimal", description: "Simple & clean" },
  { value: "bold", label: "Bold", description: "Vibrant & impactful" },
]

const postTypes = [
  { value: "how-to", label: "How-to", description: "Step-by-step guidance" },
  { value: "teardown", label: "Teardown", description: "Break down what works" },
  { value: "checklist", label: "Checklist", description: "Actionable checklist" },
  { value: "case-study", label: "Case Study", description: "Results and proof" },
  { value: "contrarian", label: "Contrarian", description: "Challenge assumptions" },
  { value: "story", label: "Story", description: "Narrative with a lesson" },
]

const MAX_CHARS = 3000

export function PostEditor({
  content,
  tone,
  postType,
  isGenerating,
  postImage,
  isGeneratingImage,
  onContentChange,
  onToneChange,
  onPostTypeChange,
  onGenerate,
  onImageChange,
  onImageGeneratingChange,
}: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [imageStyle, setImageStyle] = useState("professional")
  const selectedPostType = postTypes.find((type) => type.value === postType) ?? postTypes[0]

  const charCount = content.length
  const charPercentage = (charCount / MAX_CHARS) * 100

  const handleAddHook = async () => {
    onGenerate(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hook",
          tone,
          postType,
          currentContent: content,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate hook")

      const data = await response.json()
      onContentChange(data.content + "\n\n" + content)
    } catch (error) {
      console.error("Failed to generate hook:", error)
    } finally {
      onGenerate(false)
      textareaRef.current?.focus()
    }
  }

  const handleGenerateImage = async (style: string) => {
    if (!content.trim()) return

    setImageStyle(style)
    onImageGeneratingChange(true)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          style,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate image")

      const data = await response.json()
      onImageChange(data.imageUrl)
    } catch (error) {
      console.error("Failed to generate image:", error)
    } finally {
      onImageGeneratingChange(false)
    }
  }

  const formatText = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let newText = content
    let newCursorPos = end

    switch (format) {
      case "italic":
        newText = content.substring(0, start) + `_${selectedText}_` + content.substring(end)
        newCursorPos = end + 2
        break
      case "list":
        newText = content.substring(0, start) + `\n• ${selectedText}` + content.substring(end)
        newCursorPos = end + 3
        break
    }

    onContentChange(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenLine className="h-5 w-5 text-primary" />
            Post Editor
          </CardTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:items-center">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Tone</p>
              <Select value={tone} onValueChange={(value) => value && onToneChange(value)}>
                <SelectTrigger className="h-9 w-full border-border/70 bg-background sm:w-44">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value} textValue={t.label}>
                      <span className="font-medium">{t.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Post type</p>
              <Select value={postType} onValueChange={(value) => onPostTypeChange(value as PostType)}>
                <SelectTrigger className="h-9 w-full border-border/70 bg-background sm:w-44">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} textValue={type.label}>
                      <span className="font-medium">{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddHook}
              disabled={isGenerating}
              className="w-full gap-1.5 sm:w-auto"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              Add Hook
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!content.trim() || isGeneratingImage}
                  className="w-full gap-1.5 bg-transparent sm:w-auto"
                >
                  {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Add Image
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {imageStyles.map((style) => (
                  <DropdownMenuItem
                    key={style.value}
                    onClick={() => handleGenerateImage(style.value)}
                    className="flex flex-col items-start gap-0.5"
                  >
                    <span className="font-medium">{style.label}</span>
                    <span className="text-xs text-muted-foreground">{style.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-muted active:bg-muted/80"
              onClick={() => formatText("italic")}
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-muted active:bg-muted/80"
              onClick={() => formatText("list")}
              aria-label="List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="hover:bg-muted active:bg-muted/80" aria-label="Add link">
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {(postImage || isGeneratingImage) && (
          <div className="relative">
            {isGeneratingImage ? (
              <div className="flex items-center justify-center h-40 bg-muted rounded-lg border border-dashed">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Generating image...</span>
                </div>
              </div>
            ) : postImage ? (
              <div className="relative group">
                <img
                  src={postImage || "/placeholder.svg"}
                  alt="Generated post image"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateImage(imageStyle)}
                    className="gap-1.5"
                  >
                    <Palette className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onImageChange(null)} className="gap-1.5">
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Textarea */}
        <div className="relative overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your LinkedIn post here... Share insights, tell a story, or start a conversation."
            className="min-h-[220px] resize-none text-base leading-relaxed sm:min-h-[280px] lg:min-h-[360px]"
            maxLength={MAX_CHARS}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating content...</span>
              </div>
            </div>
          )}
        </div>

        {/* Character Counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  charPercentage > 90 ? "bg-destructive" : charPercentage > 70 ? "bg-amber-500" : "bg-primary",
                )}
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              />
            </div>
            <span className={cn("text-xs", charPercentage > 90 ? "text-destructive" : "text-muted-foreground")}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          {charPercentage > 70 && charPercentage <= 90 && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
              Getting long
            </Badge>
          )}
          {charPercentage > 90 && (
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/5">
              Near limit
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
