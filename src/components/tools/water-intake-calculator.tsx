"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Droplets, GlassWater, Sun, TimerReset, Waves } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  buildDrinkSchedule,
  computeWaterIntake,
  type Climate,
  type Sex,
  type WeightUnit,
} from "./water-intake-calculator.utils"

/** Hour-of-day the waking window starts (07:00). */
const WAKING_START_HOUR = 7

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatHour(hourOffset: number): string {
  const hour = (WAKING_START_HOUR + hourOffset) % 24
  return `${hour.toString().padStart(2, "0")}:00`
}

export function WaterIntakeCalculatorTool() {
  const t = useTranslations("WaterIntakeCalculator")
  const [weight, setWeight] = useState("65")
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg")
  const [activityMinutes, setActivityMinutes] = useState("30")
  const [cupSizeMl, setCupSizeMl] = useState("250")
  const [sex, setSex] = useState<Sex>("female")
  const [climate, setClimate] = useState<Climate>("temperate")

  const result = useMemo(
    () =>
      computeWaterIntake({
        weight: parseFloat(weight),
        weightUnit,
        activityMinutes: parseFloat(activityMinutes) || 0,
        sex,
        climate,
      }),
    [weight, weightUnit, activityMinutes, sex, climate],
  )

  const schedule = useMemo(
    () => (result ? buildDrinkSchedule(result.totalMl, parseFloat(cupSizeMl)) : []),
    [result, cupSizeMl],
  )

  const cups = useMemo(() => {
    const cupSize = parseFloat(cupSizeMl)
    return result && cupSize > 0 ? result.totalMl / cupSize : 0
  }, [result, cupSizeMl])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Waves className="h-4 w-4 text-sky-500" />
              {t("weight")}
            </Label>
            <div className="flex gap-2">
              <Input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="flex-1" />
              <div className="flex gap-1">
                {(["kg", "lb"] as const).map((unit) => (
                  <Button
                    key={unit}
                    variant={weightUnit === unit ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWeightUnit(unit)}
                  >
                    {t(`weightUnit.${unit}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("sex")}</Label>
              <div className="grid grid-cols-2 gap-1">
                {(["female", "male"] as const).map((s) => (
                  <Button key={s} variant={sex === s ? "default" : "outline"} size="sm" onClick={() => setSex(s)}>
                    {t(`sexOption.${s}`)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sun className="h-4 w-4 text-amber-500" />
                {t("climate")}
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {(["temperate", "hot"] as const).map((c) => (
                  <Button key={c} variant={climate === c ? "default" : "outline"} size="sm" onClick={() => setClimate(c)}>
                    {t(`climateOption.${c}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <TimerReset className="h-4 w-4 text-violet-500" />
              {t("activityMinutes")}
            </Label>
            <Input type="number" min="0" step="1" value={activityMinutes} onChange={(e) => setActivityMinutes(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("activityHint")}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <GlassWater className="h-4 w-4 text-emerald-500" />
              {t("cupSizeMl")}
            </Label>
            <Input type="number" min="1" step="10" value={cupSizeMl} onChange={(e) => setCupSizeMl(e.target.value)} />
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("dailyTargetLiters")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? formatNumber(result.liters, 2) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-cyan-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("dailyTargetOz")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-cyan-500">{result ? formatNumber(result.ounces, 0) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("cupsPerDay")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">{result ? formatNumber(cups, 1) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("adjustmentBoost")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">{result ? formatNumber(result.adjustmentMl, 0) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-primary/20 p-5 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">{t("scheduleTitle")}</p>
            </div>
            {result && schedule.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {schedule
                  .filter((slot) => slot.cups > 0)
                  .map((slot) => (
                    <div
                      key={slot.hour}
                      className="flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1.5 text-xs"
                    >
                      <span className="font-medium text-sky-500">{formatHour(slot.hour)}</span>
                      <span className="text-muted-foreground">
                        {slot.cups > 1 ? `× ${slot.cups}` : ""}
                        <GlassWater className="ml-0.5 inline h-3 w-3" />
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{t("invalidInput")}</p>
            )}
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3">
                <Droplets className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        total: formatNumber(result.totalMl, 0),
                        hourly: formatNumber(result.perHourMl, 0),
                      })
                    : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
