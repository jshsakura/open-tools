"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar, Clock, ListPlus, Target, Trash2, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  businessDaysUntil,
  daysUntil,
  formatDday,
  parseDateInput,
} from "./d-day-calculator.utils"

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]
}

interface SavedDday {
  id: string
  label: string
  date: string
  excludeWeekends: boolean
}

const STORAGE_KEY = "d-day-calculator-entries"

export function DDayCalculatorTool() {
  const t = useTranslations("DDayCalculator")
  const today = useMemo(() => formatDateInput(new Date()), [])
  const [targetDate, setTargetDate] = useState("")
  const [countFromToday, setCountFromToday] = useState(true)
  const [startDate, setStartDate] = useState(today)

  const [entries, setEntries] = useState<SavedDday[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newExcludeWeekends, setNewExcludeWeekends] = useState(false)

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    let stored: SavedDday[] | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch {
      // ignore corrupted storage
    }
    setEntries(stored ?? [])
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // ignore quota errors
    }
  }, [entries, hydrated])

  const result = useMemo(() => {
    if (!targetDate) {
      return null
    }

    const referenceSource = countFromToday ? today : startDate
    const referenceDate = parseDateInput(referenceSource)
    const target = parseDateInput(targetDate)

    if (!referenceDate || !target) {
      return null
    }

    const diff = daysUntil(referenceDate, target)
    const isFuture = diff > 0
    const totalDays = Math.abs(diff)
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
      const daysRemaining = result.daysRemaining ?? 0
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

    const daysPassed = result.daysPassed ?? 0
    if (daysPassed === 0) {
      return t("statusJustPassed")
    }
    if (result.weeks <= 4) {
      return t("statusRecent", { weeks: result.weeks })
    }
    return t("statusPast", { days: daysPassed, weeks: result.weeks })
  }, [result, t])

  const handleAddEntry = () => {
    if (!newDate) return
    const entry: SavedDday = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: newLabel.trim() || t("untitledEntry"),
      date: newDate,
      excludeWeekends: newExcludeWeekends,
    }
    setEntries((prev) => [...prev, entry])
    setNewLabel("")
    setNewDate("")
    setNewExcludeWeekends(false)
  }

  const handleRemoveEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const todayDate = useMemo(() => parseDateInput(today), [today])

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
                  {statusSummary
                    ? t("summaryValue", {
                        status: statusSummary,
                        targetDate: new Date(targetDate).toLocaleDateString(),
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Saved D-days */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ListPlus className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t("savedTitle")}</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label>{t("entryLabel")}</Label>
            <Input
              value={newLabel}
              placeholder={t("entryLabelPlaceholder")}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("entryDate")}</Label>
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <Button onClick={handleAddEntry} disabled={!newDate} className="w-full sm:w-auto">
            {t("addEntry")}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">{t("excludeWeekends")}</span>
          <Switch checked={newExcludeWeekends} onCheckedChange={setNewExcludeWeekends} />
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noEntries")}</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const target = parseDateInput(entry.date)
              const diff = todayDate && target ? daysUntil(todayDate, target) : 0
              const businessDiff =
                entry.excludeWeekends && todayDate && target
                  ? businessDaysUntil(todayDate, target)
                  : null
              const isFuture = diff > 0
              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {target ? target.toLocaleDateString() : entry.date}
                      {entry.excludeWeekends ? ` · ${t("businessDaysShort", { days: Math.abs(businessDiff ?? 0) })}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-lg font-black tracking-tight",
                        diff === 0 ? "text-amber-500" : isFuture ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {formatDday(diff)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEntry(entry.id)}
                      aria-label={t("removeEntry")}
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
