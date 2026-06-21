"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CalendarRange, PlusCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { businessDayCount, dayDifference, parseDate, ymdBreakdown } from "./date-calculator.utils"

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]
}

function addToDate(base: Date, amount: number, unit: "days" | "weeks" | "months") {
  const next = new Date(base)

  if (unit === "days") {
    next.setDate(next.getDate() + amount)
    return next
  }

  if (unit === "weeks") {
    next.setDate(next.getDate() + amount * 7)
    return next
  }

  next.setMonth(next.getMonth() + amount)
  return next
}

export function DateCalculatorTool() {
  const t = useTranslations("DateCalculator")
  const today = useMemo(() => formatDateInput(new Date()), [])
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [baseDate, setBaseDate] = useState(today)
  const [offset, setOffset] = useState("30")
  const [unit, setUnit] = useState<"days" | "weeks" | "months">("days")
  const [includeEnd, setIncludeEnd] = useState(false)
  const [businessOnly, setBusinessOnly] = useState(false)

  const difference = useMemo(() => {
    const start = parseDate(startDate)
    const end = parseDate(endDate)

    if (!start || !end) {
      return null
    }

    const calendarDays = dayDifference(start, end, includeEnd)
    const totalDays = businessOnly ? businessDayCount(start, end, includeEnd) : calendarDays
    const breakdown = ymdBreakdown(start, end)

    return {
      totalDays,
      weeks: Math.floor(totalDays / 7),
      monthsApprox: (calendarDays / 30.44).toFixed(1),
      breakdown,
    }
  }, [businessOnly, endDate, includeEnd, startDate])

  const adjusted = useMemo(() => {
    const base = new Date(`${baseDate}T00:00:00`)
    const amount = parseInt(offset, 10) || 0

    if (Number.isNaN(base.getTime())) {
      return null
    }

    return addToDate(base, amount, unit)
  }, [baseDate, offset, unit])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">{t("differenceTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("startDate")}</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("endDate")}</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="businessOnly" className="text-sm font-medium">{t("businessOnly")}</Label>
              <Switch id="businessOnly" checked={businessOnly} onCheckedChange={setBusinessOnly} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="includeEnd" className="text-sm font-medium">{t("includeEnd")}</Label>
              <Switch id="includeEnd" checked={includeEnd} onCheckedChange={setIncludeEnd} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard className="p-4 border-emerald-500/20">
              <p className="text-xs text-muted-foreground">{businessOnly ? t("businessDays") : t("daysBetween")}</p>
              <p className="mt-2 text-2xl font-black text-emerald-500">{difference?.totalDays ?? 0}</p>
            </GlassCard>
            <GlassCard className="p-4 border-sky-500/20">
              <p className="text-xs text-muted-foreground">{t("weeksBetween")}</p>
              <p className="mt-2 text-2xl font-black text-sky-500">{difference?.weeks ?? 0}</p>
            </GlassCard>
            <GlassCard className="p-4 border-violet-500/20">
              <p className="text-xs text-muted-foreground">{t("monthsApprox")}</p>
              <p className="mt-2 text-2xl font-black text-violet-500">{difference?.monthsApprox ?? "0.0"}</p>
            </GlassCard>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("ymdBreakdown")}</p>
            <p className="mt-2 text-lg font-bold tracking-tight">
              {difference
                ? t("ymdValue", {
                    years: difference.breakdown.years,
                    months: difference.breakdown.months,
                    days: difference.breakdown.days,
                  })
                : "-"}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">{t("offsetTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr_0.9fr]">
            <div className="space-y-2 sm:col-span-3">
              <Label>{t("baseDate")}</Label>
              <Input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input type="number" value={offset} onChange={(e) => setOffset(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("unit")}</Label>
              <Select value={unit} onValueChange={(value: "days" | "weeks" | "months") => setUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">{t("units.days")}</SelectItem>
                  <SelectItem value="weeks">{t("units.weeks")}</SelectItem>
                  <SelectItem value="months">{t("units.months")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground">{t("resultDate")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">
              {adjusted ? adjusted.toLocaleDateString() : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("offsetSummary", { amount: offset || "0", unit: t(`units.${unit}`) })}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
