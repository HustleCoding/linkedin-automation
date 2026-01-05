"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock, Save, X, Loader2, Linkedin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDrafts } from "@/hooks/use-drafts";
import { useToast } from "@/hooks/use-toast";

interface SchedulingBarProps {
  content: string;
  tone: string;
  imageUrl: string | null;
  currentDraftId: string | null;
  onDraftIdChange: (id: string | null) => void;
  scheduledDate?: Date;
  scheduledTime?: string;
  onScheduledDateChange: (date: Date | undefined) => void;
  onScheduledTimeChange: (time: string | undefined) => void;
}

export function SchedulingBar({
  content,
  tone,
  imageUrl,
  currentDraftId,
  onDraftIdChange,
  scheduledDate,
  scheduledTime,
  onScheduledDateChange,
  onScheduledTimeChange,
}: SchedulingBarProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { createDraft, updateDraft, refresh } = useDrafts();
  const { toast } = useToast();

  const normalizeDraftId = (id: string | null) => {
    if (!id) return null;
    const trimmed = id.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
    return trimmed;
  };

  const parseJsonSafely = async (response: Response) => {
    const text = await response.text();
    if (!text) {
      return {};
    }
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const hasSchedule = scheduledDate && scheduledTime;

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to save",
        description: "Please write some content first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const draftData = {
        content,
        tone,
        image_url: imageUrl,
        scheduled_at: null,
        status: "draft" as const,
      };

      const resolvedDraftId = normalizeDraftId(currentDraftId);
      if (resolvedDraftId) {
        await updateDraft({ id: resolvedDraftId, ...draftData });
        toast({
          title: "Draft updated",
          description: "Your changes have been saved",
        });
      } else {
        const draft = await createDraft(draftData);
        if (draft) {
          onDraftIdChange(draft.id);
          toast({
            title: "Draft saved",
            description: "Your draft has been saved successfully",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to schedule",
        description: "Please write some content first",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Schedule incomplete",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // First save the draft to get an ID
      let draftId = normalizeDraftId(currentDraftId);
      if (!draftId) {
        const draft = await createDraft({
          content,
          tone,
          image_url: imageUrl,
          status: "draft",
        });
        if (draft) {
          draftId = draft.id;
          onDraftIdChange(draft.id);
        }
      }

      if (!draftId) {
        throw new Error("Unable to create a draft for scheduling");
      }

      const updatedDraft = await updateDraft({
        id: draftId,
        content,
        tone,
        image_url: imageUrl,
      });
      if (!updatedDraft) {
        throw new Error("Failed to update draft before scheduling");
      }

      const [hour, minute] = scheduledTime
        .split(":")
        .map((value) => Number(value));
      if (Number.isNaN(hour) || Number.isNaN(minute)) {
        throw new Error("Invalid schedule time");
      }

      // Build a local datetime before converting to UTC ISO.
      const scheduleDateTime = new Date(
        scheduledDate.getFullYear(),
        scheduledDate.getMonth(),
        scheduledDate.getDate(),
        hour,
        minute,
        0,
        0
      ).toISOString();

      // Call publish API to schedule
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          content,
          imageUrl,
          scheduleDate: scheduleDateTime,
        }),
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        if (result.needsReconnect) {
          toast({
            title: "LinkedIn connection required",
            description:
              result.error ||
              "Please reconnect your LinkedIn account to publish.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings")}
              >
                Reconnect
              </Button>
            ),
          });
          return;
        }

        throw new Error(result.error || "Failed to schedule");
      }

      refresh();
      toast({
        title: "Post scheduled on LinkedIn",
        description: `Your post will be published on ${format(
          scheduledDate,
          "MMM d"
        )} at ${scheduledTime}`,
      });
    } catch (error) {
      toast({
        title: "Schedule failed",
        description:
          error instanceof Error ? error.message : "Failed to schedule post",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePostNow = async () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to post",
        description: "Please write some content first",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // First save the draft to get an ID
      let draftId = normalizeDraftId(currentDraftId);
      if (!draftId) {
        const draft = await createDraft({
          content,
          tone,
          image_url: imageUrl,
          status: "draft",
        });
        if (draft) {
          draftId = draft.id;
          onDraftIdChange(draft.id);
        }
      }

      // Call publish API to post immediately
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          content,
          imageUrl,
        }),
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        if (result.needsReconnect) {
          toast({
            title: "LinkedIn connection required",
            description:
              result.error ||
              "Please reconnect your LinkedIn account to publish.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings")}
              >
                Reconnect
              </Button>
            ),
          });
          return;
        }

        throw new Error(result.error || "Failed to publish");
      }

      refresh();
      toast({
        title: "Published to LinkedIn!",
        description: result.postUrl
          ? "Your post is now live. Click to view."
          : "Your post has been published successfully",
        action: result.postUrl ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(result.postUrl, "_blank")}
          >
            View Post
          </Button>
        ) : undefined,
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description:
          error instanceof Error ? error.message : "Failed to publish post",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:left-64">
      <div className="flex flex-col gap-2 px-3 py-3 sm:px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        {/* DateTime Picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal h-9 text-xs sm:text-sm",
                  !scheduledDate && "text-muted-foreground",
                  scheduledDate && "border-primary/30 bg-primary/5"
                )}
              >
                <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {scheduledDate ? format(scheduledDate, "MMM d") : "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={onScheduledDateChange}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>

          <Select value={scheduledTime} onValueChange={onScheduledTimeChange}>
            <SelectTrigger
              className={cn(
                "w-20 sm:w-24 h-9 text-xs sm:text-sm",
                scheduledTime && "border-primary/30 bg-primary/5"
              )}
            >
              <Clock className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasSchedule && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => {
                onScheduledDateChange(undefined);
                onScheduledTimeChange(undefined);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 sm:gap-2 h-9 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span>{isSaving ? "Saving..." : "Draft"}</span>
          </Button>

          {hasSchedule ? (
            <Button
              size="sm"
              className="gap-1.5 sm:gap-2 h-9 bg-[#0A66C2] hover:bg-[#004182] text-xs sm:text-sm"
              onClick={handleSchedule}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline">
                {isPublishing
                  ? "Scheduling..."
                  : `Schedule ${format(
                      scheduledDate!,
                      "MMM d"
                    )} ${scheduledTime}`}
              </span>
              <span className="sm:hidden">
                {isPublishing ? "..." : "Schedule"}
              </span>
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 sm:gap-2 h-9 bg-[#0A66C2] hover:bg-[#004182] hover:shadow-[0_0_20px_rgba(10,102,194,0.3)] transition-shadow text-xs sm:text-sm"
              onClick={handlePostNow}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span>{isPublishing ? "Publishing..." : "Post to LinkedIn"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
