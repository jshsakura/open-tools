"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CalendarHeart, Sparkles, Info, CalendarDays } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]
}

function addDays(base: Date, days: number) {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date: Date | null) {
  if (!date) return "-"
  return date.toLocaleDateString()
}

const LUTEAL_PHASE_DAYS = 14
const FERTILE_DAYS_BEFORE_OVULATION = 5

export function OvulationCalculatorTool() {
  const t = useTranslations("OvulationCalculator")
  const today = useMemo(() => formatDateInput(new Date()), [])
  const [lastPeriodDate, setLastPeriodDate] = useState(today)
  const [cycleLength, setCycleLength] = useState("28")
  const [periodLength, setPeriodLength] = useState("5")

  const results = useMemo(() => {
    if (!lastPeriodDate) {
      return null
    }

    const lastPeriod = new Date(`${lastPeriodDate}T00:00:00`)
    const cycle = parseInt(cycleLength, 10) || 28
    const period = parseInt(periodLength, 10) || 5

    if (Number.isNaN(lastPeriod.getTime()) || cycle < 21 || cycle > 40 || period < 2 || period > 7) {
      return null
    }

    const nextPeriodDate = addDays(lastPeriod, cycle)
    const ovulationDate = addDays(nextPeriodDate, -LUTEAL_PHASE_DAYS)
    const fertileWindowStart = addDays(ovulationDate, -FERTILE_DAYS_BEFORE_OVULATION)
    const fertileWindowEnd = ovulationDate

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24))
    const currentCycleDay = daysSinceLastPeriod + 1

    return {
      nextPeriodDate,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      currentCycleDay: currentCycleDay > 0 && currentCycleDay <= cycle ? currentCycleDay : null,
      cycleLength: cycle,
      periodLength: period,
    }
  }, [lastPeriodDate, cycleLength, periodLength])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <GlassCard className="p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-start gap-3 mb-4">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-rose-500" />
              {t("lastPeriodDate")}
            </Label>
            <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("cycleLength")}</Label>
              <Input
                type="number"
                min="21"
                max="40"
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("cycleLengthHint")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("periodLength")}</Label>
              <Input
                type="number"
                min="2"
                max="7"
                value={periodLength}
                onChange={(e) => setPeriodLength(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("periodLengthHint")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 border-rose-500/20">
            <p className="text-sm text-muted-foreground">{t("ovulationDate")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-rose-500">
              {results ? formatDate(results.ovulationDate) : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {results ? t("ovulationHint") : t("invalidInput")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-purple-500/20">
            <p className="text-sm text-muted-foreground">{t("fertileWindow")}</p>
            <p className="mt-2 text-xl font-bold tracking-tight text-purple-500">
              {results ? `${formatDate(results.fertileWindowStart)}` : "-"}
            </p>
            <p className="mt-1 text-lg font-bold text-purple-500">
              {results ? `${t("to")} ${formatDate(results.fertileWindowEnd)}` : ""}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {results ? t("fertileWindowHint") : t("invalidInput")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-sky-500/20">
            <p className="text-sm text-muted-foreground">{t("nextPeriod")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-sky-500">
              {results ? formatDate(results.nextPeriodDate) : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {results ? t("nextPeriodHint", { days: results.cycleLength }) : t("invalidInput")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("currentCycleDay")}</p>
                <p className="mt-2 text-2xl font-black text-emerald-500">
                  {results?.currentCycleDay ? `${t("day")} ${results.currentCycleDay}` : "-"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {results ? t("currentCycleHint", { cycle: results.cycleLength }) : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarHeart className="h-5 w-5 text-rose-500" />
          <h3 className="font-semibold">{t("understandingTitle")}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">{t("ovulationLabel")}</p>
            <p>{t("ovulationDescription")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">{t("fertileWindowLabel")}</p>
            <p>{t("fertileWindowDescription")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">{t("cycleLabel")}</p>
            <p>{t("cycleDescription")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">{t("variationLabel")}</p>
            <p>{t("variationDescription")}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
