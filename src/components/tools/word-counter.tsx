"use client"

import { useState, useMemo } from "react"
import { Type, Trash2, Clock, BookOpen, AlignLeft, Hash, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

interface Stat {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  description?: string
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60)
    return `${seconds}s`
  }
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

export function WordCounter() {
  const [text, setText] = useState("")

  const stats = useMemo(() => {
    const charsWithSpaces = text.length
    const charsNoSpaces = text.replace(/\s/g, "").length
    const words =
      text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length
    const sentences =
      text.trim() === ""
        ? 0
        : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const paragraphs =
      text.trim() === ""
        ? 0
        : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    const lines = text === "" ? 0 : text.split("\n").length
    const readingMinutes = words / 200
    const speakingMinutes = words / 130

    return {
      charsWithSpaces,
      charsNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime: words === 0 ? "—" : formatTime(readingMinutes),
      speakingTime: words === 0 ? "—" : formatTime(speakingMinutes),
    }
  }, [text])

  const statCards: Stat[] = [
    {
      label: "Characters",
      value: stats.charsWithSpaces.toLocaleString(),
      icon: Hash,
      iconColor: "text-blue-500",
      description: "incl. spaces",
    },
    {
      label: "Characters",
      value: stats.charsNoSpaces.toLocaleString(),
      icon: Hash,
      iconColor: "text-sky-500",
      description: "excl. spaces",
    },
    {
      label: "Words",
      value: stats.words.toLocaleString(),
      icon: Type,
      iconColor: "text-emerald-500",
    },
    {
      label: "Sentences",
      value: stats.sentences.toLocaleString(),
      icon: MessageSquare,
      iconColor: "text-teal-500",
    },
    {
      label: "Paragraphs",
      value: stats.paragraphs.toLocaleString(),
      icon: AlignLeft,
      iconColor: "text-green-500",
    },
    {
      label: "Lines",
      value: stats.lines.toLocaleString(),
      icon: FileText,
      iconColor: "text-cyan-500",
    },
    {
      label: "Reading Time",
      value: stats.readingTime,
      icon: BookOpen,
      iconColor: "text-violet-500",
      description: "@ 200 wpm",
    },
    {
      label: "Speaking Time",
      value: stats.speakingTime,
      icon: Clock,
      iconColor: "text-purple-500",
      description: "@ 130 wpm",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-500" />
            Your Text
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
            disabled={!text}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
        <Textarea
          placeholder="Start typing or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[240px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y leading-relaxed"
          autoFocus
        />
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <GlassCard
              key={i}
              className={cn(
                "p-4 flex flex-col gap-2 transition-all duration-200",
                text ? "opacity-100" : "opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                  {stat.description && (
                    <span className="ml-1 text-muted-foreground/60">
                      ({stat.description})
                    </span>
                  )}
                </span>
                <Icon className={cn("w-4 h-4", stat.iconColor)} />
              </div>
              <p
                className={cn(
                  "text-2xl font-bold tracking-tight tabular-nums",
                  stat.value === "—" && "text-muted-foreground",
                )}
              >
                {stat.value}
              </p>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
