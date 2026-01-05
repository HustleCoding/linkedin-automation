"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Smartphone, Globe, ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react"
import { SparkleLoader } from "./sparkle-loader"
import { useState } from "react"

interface LinkedInPreviewProps {
  content: string
  isGenerating: boolean
  postImage?: string | null
}

export function LinkedInPreview({ content, isGenerating, postImage }: LinkedInPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldTruncate = content.length > 300
  const displayContent = shouldTruncate && !isExpanded ? content.substring(0, 300) : content

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .split("\n")
      .map((line, i) => (
        <span key={i}>
          {line.startsWith("• ") ? (
            <span className="flex gap-1">
              <span>•</span>
              <span dangerouslySetInnerHTML={{ __html: line.substring(2) }} />
            </span>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: line }} />
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      ))
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          LinkedIn Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px]">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border-[3px] border-foreground/10 bg-foreground/5 p-1 sm:p-1.5 shadow-xl">
            <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-card overflow-hidden">
              {/* Dynamic Island */}
              <div className="flex items-center justify-center py-1.5 sm:py-2 bg-card">
                <div className="h-5 w-20 sm:h-[22px] sm:w-[90px] rounded-full bg-foreground/90" />
              </div>

              {/* LinkedIn Post */}
              <div className="bg-card min-h-[350px] sm:min-h-[400px] max-h-[500px] overflow-y-auto">
                {isGenerating ? (
                  <div className="flex h-[350px] sm:h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <SparkleLoader />
                      <span className="text-sm text-muted-foreground">Updating preview...</span>
                    </div>
                  </div>
                ) : content ? (
                  <div className="space-y-2 sm:space-y-3 p-2.5 sm:p-3">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-2 ring-background flex-shrink-0">
                          <AvatarImage src="/placeholder.svg?height=44&width=44" alt="User" />
                          <AvatarFallback className="text-xs">JD</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-semibold text-foreground">John Doe</p>
                            <span className="text-muted-foreground hidden sm:inline">•</span>
                            <button className="text-[10px] sm:text-xs font-semibold text-primary hover:underline">
                              Follow
                            </button>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                            Product Manager | AI Enthusiast
                          </p>
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                            <span>Just now</span>
                            <span>•</span>
                            <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 -mr-1 flex-shrink-0">
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-1">
                      <div className="text-[11px] sm:text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
                        {formatContent(displayContent)}
                        {shouldTruncate && !isExpanded && (
                          <button
                            onClick={() => setIsExpanded(true)}
                            className="text-muted-foreground hover:text-primary hover:underline"
                          >
                            ...see more
                          </button>
                        )}
                      </div>
                    </div>

                    {postImage && (
                      <div className="-mx-2.5 sm:-mx-3">
                        <img
                          src={postImage || "/placeholder.svg"}
                          alt="Post image"
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#0A66C2]">
                            <ThumbsUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" fill="white" />
                          </div>
                          <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500">
                            <span className="text-[6px] sm:text-[8px]">❤️</span>
                          </div>
                          <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#7FC15E]">
                            <span className="text-[6px] sm:text-[8px]">👏</span>
                          </div>
                        </div>
                        <span>24</span>
                      </div>
                      <span className="truncate">3 comments • 2 reposts</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between -mx-1">
                      {[
                        { icon: ThumbsUp, label: "Like" },
                        { icon: MessageCircle, label: "Comment" },
                        { icon: Repeat2, label: "Repost" },
                        { icon: Send, label: "Send" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1 py-2 text-muted-foreground transition-colors hover:bg-muted rounded-lg"
                        >
                          <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[350px] sm:h-[400px] flex-col items-center justify-center gap-3 sm:gap-4 text-center px-4 sm:px-6">
                    <div className="rounded-full bg-primary/10 p-3 sm:p-4">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground text-xs sm:text-sm">Preview your post</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                        Start typing to see how your post will appear on LinkedIn
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator */}
              <div className="flex justify-center py-1.5 sm:py-2 bg-card">
                <div className="h-1 w-24 sm:w-28 rounded-full bg-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
