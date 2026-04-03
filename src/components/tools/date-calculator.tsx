"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CalendarRange, PlusCircle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const difference = useMemo(() => {
    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T00:00:00`)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null
    }

    const diffMs = Math.abs(end.getTime() - start.getTime())
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return {
      totalDays,
      weeks: Math.floor(totalDays / 7),
      monthsApprox: (totalDays / 30.44).toFixed(1),
    }
  }, [endDate, startDate])

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

          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard className="p-4 border-emerald-500/20">
              <p className="text-xs text-muted-foreground">{t("daysBetween")}</p>
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
