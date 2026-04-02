"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Type, Trash2, Clock, BookOpen, AlignLeft, Hash, FileText, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { getWordCounterStats } from "./word-counter.utils"

interface Stat {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  description?: string
}

export function WordCounter() {
  const t = useTranslations("WordCounter")
  const [text, setText] = useState("")

  const stats = useMemo(() => {
    return getWordCounterStats(text)
  }, [text])

  const statCards: Stat[] = [
    {
      label: t("characters"),
      value: stats.charsWithSpaces.toLocaleString(),
      icon: Hash,
      iconColor: "text-blue-500",
      description: t("inclSpaces"),
    },
    {
      label: t("characters"),
      value: stats.charsNoSpaces.toLocaleString(),
      icon: Hash,
      iconColor: "text-sky-500",
      description: t("exclSpaces"),
    },
    {
      label: t("words"),
      value: stats.words.toLocaleString(),
      icon: Type,
      iconColor: "text-emerald-500",
    },
    {
      label: t("sentences"),
      value: stats.sentences.toLocaleString(),
      icon: MessageSquare,
      iconColor: "text-teal-500",
    },
    {
      label: t("paragraphs"),
      value: stats.paragraphs.toLocaleString(),
      icon: AlignLeft,
      iconColor: "text-green-500",
    },
    {
      label: t("lines"),
      value: stats.lines.toLocaleString(),
      icon: FileText,
      iconColor: "text-cyan-500",
    },
    {
      label: t("readingTime"),
      value: stats.readingTime,
      icon: BookOpen,
      iconColor: "text-violet-500",
      description: t("readingSpeed"),
    },
    {
      label: t("speakingTime"),
      value: stats.speakingTime,
      icon: Clock,
      iconColor: "text-purple-500",
      description: t("speakingSpeed"),
    },
  ]

  const getStatKey = (stat: Stat, index: number): string => {
    return `${stat.label}-${stat.description || index}`
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-500" />
            {t("yourText")}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
            disabled={!text}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {t("clear")}
          </Button>
        </div>
        <Textarea
          placeholder={t("placeholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[240px] font-mono text-sm bg-background/50 focus:bg-background transition-all resize-y leading-relaxed"
          autoFocus
        />
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <GlassCard
              key={getStatKey(stat, i)}
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
