"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Droplets, GlassWater, TimerReset, Waves } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0)
}

export function WaterIntakeCalculatorTool() {
  const t = useTranslations("WaterIntakeCalculator")
  const [weightKg, setWeightKg] = useState("65")
  const [activityMinutes, setActivityMinutes] = useState("30")
  const [cupSizeMl, setCupSizeMl] = useState("250")

  const result = useMemo(() => {
    const weight = parseFloat(weightKg)
    const activity = parseFloat(activityMinutes) || 0
    const cupSize = parseFloat(cupSizeMl)

    if (!Number.isFinite(weight) || !Number.isFinite(cupSize) || weight <= 0 || cupSize <= 0 || activity < 0) {
      return null
    }

    const baseMl = weight * 33
    const activityExtraMl = activity * 12
    const totalMl = baseMl + activityExtraMl
    const liters = totalMl / 1000
    const cups = totalMl / cupSize
    const perHourMl = totalMl / 16

    return {
      baseMl,
      activityExtraMl,
      totalMl,
      liters,
      cups,
      perHourMl,
    }
  }, [activityMinutes, cupSizeMl, weightKg])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Waves className="h-4 w-4 text-sky-500" />
              {t("weightKg")}
            </Label>
            <Input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
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

          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("cupsPerDay")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">{result ? formatNumber(result.cups, 1) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("baseAmount")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">{result ? formatNumber(result.baseMl, 0) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("activityBoost")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-amber-500">{result ? formatNumber(result.activityExtraMl, 0) : "-"}</p>
          </GlassCard>

          <GlassCard className="border-primary/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Droplets className="h-5 w-5 text-primary" />
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
