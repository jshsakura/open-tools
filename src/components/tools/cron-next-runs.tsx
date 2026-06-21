"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { CalendarClock, Clock, Copy, Check } from "lucide-react"

import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  describeCron,
  nextRuns,
  type CronTimezone,
} from "./cron-next-runs.utils"

const RUN_COUNT = 10

const PRESETS = [
  { label: "everyMinute", value: "* * * * *" },
  { label: "every5Minutes", value: "*/5 * * * *" },
  { label: "everyHour", value: "0 * * * *" },
  { label: "dailyAtMidnight", value: "0 0 * * *" },
  { label: "everyMonday9am", value: "0 9 * * 1" },
  { label: "firstOfMonth", value: "0 0 1 * *" },
] as const

type AnalysisResult = {
  description: string
  runs: Date[]
}

function formatRun(date: Date, tz: CronTimezone): string {
  return date.toLocaleString(undefined, {
    timeZone: tz === "utc" ? "UTC" : undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  })
}

export function CronNextRuns() {
  const t = useTranslations("CronNextRuns")
  const locale = useLocale()

  const [expression, setExpression] = useState("*/5 * * * *")
  const [timezone, setTimezone] = useState<CronTimezone>("local")
  const [isCopied, setIsCopied] = useState(false)

  const { result, error } = useMemo<{
    result: AnalysisResult | null
    error: string | null
  }>(() => {
    const trimmed = expression.trim()
    if (!trimmed) {
      return { result: null, error: null }
    }
    try {
      const description = describeCron(trimmed, locale)
      const runs = nextRuns(trimmed, RUN_COUNT, timezone)
      return { result: { description, runs }, error: null }
    } catch {
      return { result: null, error: t("invalidExpression") }
    }
  }, [expression, timezone, locale, t])

  const handleCopy = async () => {
    if (!result) return
    try {
      const text = result.runs
        .map((run) => formatRun(run, timezone))
        .join("\n")
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success(t("copied"))
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error(t("copyFailed"))
    }
  }

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <GlassCard className="p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <Label>{t("cronExpression")}</Label>
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="*/5 * * * *"
              className="h-14 text-2xl font-mono bg-muted/20 border-border/40 focus:ring-cyan-500/50 rounded-xl text-center tracking-widest"
            />
            <p className="text-xs text-muted-foreground">{t("fieldHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("timezone")}</Label>
            <Select
              value={timezone}
              onValueChange={(value) => setTimezone(value as CronTimezone)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">{t("tzLocal")}</SelectItem>
                <SelectItem value="utc">{t("tzUtc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-center font-medium">
              {error}
            </div>
          ) : result ? (
            <div className="p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center space-y-2">
              <div className="text-sm text-cyan-500/80 font-medium uppercase tracking-wider">
                {t("schedule")}
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                “{result.description}”
              </div>
            </div>
          ) : null}
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setExpression(preset.value)}
              className="p-3 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/40 text-sm text-left transition-colors flex flex-col gap-1 group"
            >
              <span className="font-medium text-foreground">
                {t(`presets.${preset.label}`)}
              </span>
              <span className="font-mono text-xs text-muted-foreground group-hover:text-cyan-500 transition-colors">
                {preset.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <GlassCard className="p-8 rounded-2xl h-full">
          <div className="flex items-center justify-between mb-6 gap-3">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-500" />
              {t("nextRuns", { count: RUN_COUNT })}
            </Label>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl shrink-0"
              onClick={handleCopy}
              disabled={!result}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-2">{t("copyList")}</span>
            </Button>
          </div>

          {result ? (
            <ol className="space-y-3">
              {result.runs.map((run, i) => (
                <li
                  key={i}
                  className="flex gap-4 items-center p-3 rounded-xl bg-muted/20 border border-border/40"
                >
                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 text-right">
                    {i + 1}
                  </span>
                  <Clock className="w-4 h-4 text-cyan-500/70 shrink-0" />
                  <span className="flex-1 font-mono text-sm">
                    {formatRun(run, timezone)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-center py-12 text-muted-foreground italic">
              {error ? t("fixToSeeRuns") : t("enterValidCron")}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
