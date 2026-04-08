"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Activity, Flame, Scale, UserRound } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const activityMultipliers = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
} as const

export function CalorieCalculatorTool() {
  const t = useTranslations("CalorieCalculator")
  const [sex, setSex] = useState<"male" | "female">("male")
  const [age, setAge] = useState("30")
  const [heightCm, setHeightCm] = useState("170")
  const [weightKg, setWeightKg] = useState("65")
  const [activityLevel, setActivityLevel] = useState<keyof typeof activityMultipliers>("moderate")

  const result = useMemo(() => {
    const parsedAge = Number.parseFloat(age)
    const height = Number.parseFloat(heightCm)
    const weight = Number.parseFloat(weightKg)

    if (
      !Number.isFinite(parsedAge) ||
      !Number.isFinite(height) ||
      !Number.isFinite(weight) ||
      parsedAge <= 0 ||
      height <= 0 ||
      weight <= 0
    ) {
      return null
    }

    const bmr = sex === "male"
      ? 10 * weight + 6.25 * height - 5 * parsedAge + 5
      : 10 * weight + 6.25 * height - 5 * parsedAge - 161

    const maintenance = bmr * activityMultipliers[activityLevel]
    const mildCut = maintenance - 350
    const mildGain = maintenance + 300
    const proteinMin = weight * 1.4
    const proteinMax = weight * 2.0

    return {
      maintenance,
      mildCut,
      mildGain,
      proteinMin,
      proteinMax,
    }
  }, [activityLevel, age, heightCm, sex, weightKg])

  const formatCalories = (value: number) => Math.round(value).toLocaleString()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <UserRound className="h-4 w-4 text-sky-500" />
              {t("sex")}
            </Label>
            <Select value={sex} onValueChange={(value: "male" | "female") => setSex(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="female">{t("female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("age")}</Label>
              <Input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("heightCm")}</Label>
              <Input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("weightKg")}</Label>
              <Input type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t("activityLevel")}
            </Label>
            <Select value={activityLevel} onValueChange={(value: keyof typeof activityMultipliers) => setActivityLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("activity.low")}</SelectItem>
                <SelectItem value="light">{t("activity.light")}</SelectItem>
                <SelectItem value="moderate">{t("activity.moderate")}</SelectItem>
                <SelectItem value="high">{t("activity.high")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("activityHint")}</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-orange-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("maintenanceCalories")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-orange-500">
              {result ? formatCalories(result.maintenance) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-sky-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("mildCutCalories")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? formatCalories(result.mildCut) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("mildGainCalories")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">
              {result ? formatCalories(result.mildGain) : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5">
            <p className="text-sm text-muted-foreground">{t("proteinRange")}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">
              {result ? `${Math.round(result.proteinMin)}–${Math.round(result.proteinMax)} g` : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {result
                    ? t("summary", {
                        maintenance: formatCalories(result.maintenance),
                        cut: formatCalories(result.mildCut),
                        gain: formatCalories(result.mildGain),
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
