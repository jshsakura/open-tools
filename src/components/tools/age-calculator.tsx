"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Cake, CalendarClock, Gift, Sparkles } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  koreanCountingAge,
  koreanManAge,
  koreanYearAge,
  totalDaysLived,
  totalHoursLived,
  totalMonthsLived,
  weekdayKey,
  westernAge,
  zodiacForYear,
} from "./age-calculator.utils"

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

    const { years, months, days } = westernAge(birth, target)
    const totalDays = totalDaysLived(birth, target)
    const totalWeeks = Math.floor(totalDays / 7)
    const nextBirthdayIn = daysUntilNextBirthday(birth, target)

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      nextBirthdayIn,
      manAge: koreanManAge(birth, target),
      countingAge: koreanCountingAge(birth, target),
      yearAge: koreanYearAge(birth, target),
      totalMonths: totalMonthsLived(birth, target),
      totalHours: totalHoursLived(birth, target),
      bornWeekday: weekdayKey(birth),
      zodiac: zodiacForYear(birth.getFullYear()),
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

          <GlassCard className="p-5 border-amber-500/20 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("koreanAge")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("manAge")}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-amber-500">
                  {result ? `${result.manAge}${t("yearsCounter")}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("countingAge")}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-amber-500">
                  {result ? `${result.countingAge}${t("yearsCounter")}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("yearAge")}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-amber-500">
                  {result ? `${result.yearAge}${t("yearsCounter")}` : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-teal-500/20">
            <p className="text-sm text-muted-foreground">{t("totalMonths")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-teal-500">
              {result ? result.totalMonths.toLocaleString() : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result ? `${result.totalHours.toLocaleString()} ${t("hours")}` : t("invalidRange")}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-rose-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-500/10 p-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bornOn")}</p>
                <p className="mt-2 text-lg font-bold tracking-tight">
                  {result ? `${t(`weekdays.${result.bornWeekday}`)} · ${t(`zodiac.${result.zodiac}`)}` : "-"}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
