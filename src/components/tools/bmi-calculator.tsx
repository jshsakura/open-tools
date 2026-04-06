"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Activity, HeartPulse, Ruler, Scale } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function getBmiCategory(bmi: number, t: ReturnType<typeof useTranslations>) {
  if (bmi < 18.5) return t("underweight")
  if (bmi < 25) return t("normal")
  if (bmi < 30) return t("overweight")
  return t("obesity")
}

export function BmiCalculatorTool() {
  const t = useTranslations("BmiCalculator")
  const [heightCm, setHeightCm] = useState("170")
  const [weightKg, setWeightKg] = useState("65")

  const result = useMemo(() => {
    const height = parseFloat(heightCm)
    const weight = parseFloat(weightKg)

    if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
      return null
    }

    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    const healthyMin = 18.5 * heightInMeters * heightInMeters
    const healthyMax = 24.9 * heightInMeters * heightInMeters

    return {
      bmi,
      category: getBmiCategory(bmi, t),
      healthyMin,
      healthyMax,
    }
  }, [heightCm, t, weightKg])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Ruler className="h-4 w-4 text-sky-500" />
              {t("height")}
            </Label>
            <Input type="number" min="0" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("heightHint")}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Scale className="h-4 w-4 text-emerald-500" />
              {t("weight")}
            </Label>
            <Input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            <p className="text-xs text-muted-foreground">{t("weightHint")}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5 border-sky-500/20">
            <p className="text-sm text-muted-foreground">{t("bmiScore")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? result.bmi.toFixed(1) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-emerald-500/20">
            <p className="text-sm text-muted-foreground">{t("category")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">
              {result ? result.category : "-"}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-violet-500/20 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3">
                <HeartPulse className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("healthyRange")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">
                  {result ? `${result.healthyMin.toFixed(1)} kg – ${result.healthyMax.toFixed(1)} kg` : "-"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result ? t("healthyRangeSummary", {
                    min: result.healthyMin.toFixed(1),
                    max: result.healthyMax.toFixed(1),
                  }) : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-amber-500/20 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dailyNoteTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result ? t("dailyNoteSummary", { category: result.category }) : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
