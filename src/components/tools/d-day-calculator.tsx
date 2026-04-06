"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar, Clock, Target, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { cn } from "@/lib/utils"

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]
}

export function DDayCalculatorTool() {
  const t = useTranslations("DDayCalculator")
  const today = useMemo(() => formatDateInput(new Date()), [])
  const [targetDate, setTargetDate] = useState("")
  const [countFromToday, setCountFromToday] = useState(true)
  const [startDate, setStartDate] = useState(today)

  const result = useMemo(() => {
    if (!targetDate) {
      return null
    }

    const referenceSource = countFromToday ? today : startDate
    const referenceDate = new Date(`${referenceSource}T00:00:00`)
    const target = new Date(`${targetDate}T00:00:00`)

    if (Number.isNaN(referenceDate.getTime()) || Number.isNaN(target.getTime())) {
      return null
    }

    const diffMs = target.getTime() - referenceDate.getTime()
    const isFuture = diffMs > 0
    const absDiffMs = Math.abs(diffMs)
    const totalDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(totalDays / 7)
    const monthsApprox = (totalDays / 30.44).toFixed(1)

    return {
      totalDays,
      weeks,
      monthsApprox,
      isFuture,
      daysRemaining: isFuture ? totalDays : null,
      daysPassed: isFuture ? null : totalDays,
    }
  }, [targetDate, countFromToday, startDate, today])

  const statusSummary = useMemo(() => {
    if (!result) {
      return null
    }

    if (result.isFuture) {
      const daysRemaining = result.daysRemaining ?? 0;
      if (daysRemaining === 0) {
        return t("statusToday")
      }
      if (daysRemaining === 1) {
        return t("statusTomorrow")
      }
      if (result.weeks === 0 && daysRemaining <= 7) {
        return t("statusThisWeek")
      }
      if (result.weeks <= 4) {
        return t("statusThisMonth", { weeks: result.weeks })
      }
      return t("statusFuture", { days: daysRemaining, weeks: result.weeks })
    }
    
    const daysPassed = result.daysPassed ?? 0;
    if (daysPassed === 0) {
      return t("statusJustPassed")
    }
    if (result.weeks <= 4) {
      return t("statusRecent", { weeks: result.weeks })
    }
    return t("statusPast", { days: daysPassed, weeks: result.weeks })
  }, [result, t])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">{t("targetDateTitle")}</h3>
          </div>

          <div className="space-y-2">
            <Label>{t("targetDate")}</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-500" />
              <span className="text-sm text-muted-foreground">{t("countFromToday")}</span>
            </div>
            <Switch checked={countFromToday} onCheckedChange={setCountFromToday} />
          </div>

          {!countFromToday ? (
            <div className="space-y-2">
              <Label>{t("startDate")}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          ) : null}
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 border-emerald-500/20">
            <p className="text-sm text-muted-foreground">{t("daysRemaining")}</p>
            <p className={cn("mt-2 text-3xl font-black tracking-tight", result?.isFuture ? "text-emerald-500" : "text-rose-500")}>
              {result ? (result.isFuture ? result.daysRemaining : result.daysPassed) : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result ? (result.isFuture ? t("daysUntilTarget") : t("daysSinceTarget")) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-sky-500/20">
            <p className="text-sm text-muted-foreground">{t("weeksApprox")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? result.weeks : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("weeksHint")}</p>
          </GlassCard>

          <GlassCard className="p-5 border-violet-500/20">
            <p className="text-sm text-muted-foreground">{t("monthsApprox")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">
              {result ? result.monthsApprox : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("monthsHint")}</p>
          </GlassCard>

          <GlassCard className="p-5 border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2">
                {result?.isFuture ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-rose-500" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("statusSummary")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {statusSummary ? t("summaryValue", {
                    status: statusSummary,
                    targetDate: new Date(targetDate).toLocaleDateString(),
                  }) : "-"}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
