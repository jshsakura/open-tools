"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Cake, CalendarClock, Gift } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]
}

function daysUntilNextBirthday(birthDate: Date, targetDate: Date) {
  const nextBirthday = new Date(targetDate)
  nextBirthday.setMonth(birthDate.getMonth(), birthDate.getDate())
  nextBirthday.setHours(0, 0, 0, 0)

  const normalizedTarget = new Date(targetDate)
  normalizedTarget.setHours(0, 0, 0, 0)

  if (nextBirthday < normalizedTarget) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
  }

  return Math.ceil((nextBirthday.getTime() - normalizedTarget.getTime()) / (1000 * 60 * 60 * 24))
}

export function AgeCalculatorTool() {
  const t = useTranslations("AgeCalculator")
  const today = useMemo(() => formatDateInput(new Date()), [])
  const [birthDate, setBirthDate] = useState("1995-06-15")
  const [targetDate, setTargetDate] = useState(today)

  const result = useMemo(() => {
    if (!birthDate || !targetDate) {
      return null
    }

    const birth = new Date(`${birthDate}T00:00:00`)
    const target = new Date(`${targetDate}T00:00:00`)

    if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime()) || target < birth) {
      return null
    }

    let years = target.getFullYear() - birth.getFullYear()
    let months = target.getMonth() - birth.getMonth()
    let days = target.getDate() - birth.getDate()

    if (days < 0) {
      const previousMonth = new Date(target.getFullYear(), target.getMonth(), 0)
      days += previousMonth.getDate()
      months -= 1
    }

    if (months < 0) {
      months += 12
      years -= 1
    }

    const diffMs = target.getTime() - birth.getTime()
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.floor(totalDays / 7)
    const nextBirthdayIn = daysUntilNextBirthday(birth, target)

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      nextBirthdayIn,
    }
  }, [birthDate, targetDate])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Cake className="h-4 w-4 text-pink-500" />
              {t("birthDate")}
            </Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4 text-sky-500" />
              {t("targetDate")}
            </Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 border-pink-500/20">
            <p className="text-sm text-muted-foreground">{t("ageNow")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-pink-500">
              {result ? `${result.years}${t("yearsUnit")}` : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result ? `${result.months}${t("monthsUnit")} ${result.days}${t("daysUnit")}` : t("invalidRange")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-sky-500/20">
            <p className="text-sm text-muted-foreground">{t("totalDays")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? result.totalDays.toLocaleString() : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result ? `${result.totalWeeks.toLocaleString()} ${t("weeks")}` : t("invalidRange")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-violet-500/20">
            <p className="text-sm text-muted-foreground">{t("nextBirthday")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">
              {result ? result.nextBirthdayIn.toLocaleString() : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("daysUntil")}</p>
          </GlassCard>

          <GlassCard className="p-5 border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2">
                <Gift className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("lifeSnapshot")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result ? t("snapshotValue", {
                    years: result.years,
                    months: result.months,
                    days: result.days,
                    totalDays: result.totalDays.toLocaleString(),
                  }) : t("invalidRange")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
