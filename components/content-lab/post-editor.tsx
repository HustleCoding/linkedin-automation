"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sparkles, Lightbulb, Bold, Italic, List, Link2, ImagePlus, X, Palette, Loader2 } from "lucide-react"
import { SparkleLoader } from "./sparkle-loader"
import { cn } from "@/lib/utils"

interface PostEditorProps {
  content: string
  tone: string
  isGenerating: boolean
  postImage: string | null
  isGeneratingImage: boolean
  onContentChange: (content: string) => void
  onToneChange: (tone: string) => void
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

const MAX_CHARS = 3000

export function PostEditor({
  content,
  tone,
  isGenerating,
  postImage,
  isGeneratingImage,
  onContentChange,
  onToneChange,
  onGenerate,
  onImageChange,
  onImageGeneratingChange,
}: PostEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [imageStyle, setImageStyle] = useState("professional")

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
      case "bold":
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end)
        newCursorPos = end + 4
        break
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
        <div className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Post Editor
          </CardTitle>
          <div className="overflow-hidden">
            <ToggleGroup
              type="single"
              value={tone}
              onValueChange={(value) => value && onToneChange(value)}
              className="flex flex-wrap gap-1"
            >
              {tones.map((t) => (
                <ToggleGroupItem
                  key={t.value}
                  value={t.value}
                  size="sm"
                  className="whitespace-nowrap px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {t.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddHook}
            disabled={isGenerating}
            className="gap-1.5 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
          >
            {isGenerating ? <SparkleLoader size="sm" /> : <Lightbulb className="h-4 w-4" />}
            Add Hook
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!content.trim() || isGeneratingImage}
                className="gap-1.5 bg-transparent"
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

          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted active:bg-muted/80"
            onClick={() => formatText("bold")}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted active:bg-muted/80"
            onClick={() => formatText("italic")}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted active:bg-muted/80"
            onClick={() => formatText("list")}
            aria-label="List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted active:bg-muted/80"
            aria-label="Add link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
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
            className="min-h-[280px] resize-none text-base leading-relaxed lg:min-h-[360px]"
            maxLength={MAX_CHARS}
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <SparkleLoader />
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
