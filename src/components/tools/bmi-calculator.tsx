"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Activity, HeartPulse, Ruler, Scale } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  computeBmi,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  gaugePosition,
  type BmiCategory,
} from "./bmi-calculator.utils"

type Unit = "metric" | "imperial"

const CATEGORY_KEY: Record<BmiCategory, string> = {
  underweight: "underweight",
  normal: "normal",
  overweight: "overweight",
  obesity: "obesity",
}

const GAUGE_BANDS = [
  { className: "bg-sky-500", flex: 8.5 }, // 10 - 18.5
  { className: "bg-emerald-500", flex: 6.5 }, // 18.5 - 25
  { className: "bg-amber-500", flex: 5 }, // 25 - 30
  { className: "bg-rose-500", flex: 10 }, // 30 - 40
]

export function BmiCalculatorTool() {
  const t = useTranslations("BmiCalculator")
  const [unit, setUnit] = useState<Unit>("metric")
  const [heightCm, setHeightCm] = useState("170")
  const [weightKg, setWeightKg] = useState("65")
  const [feet, setFeet] = useState("5")
  const [inches, setInches] = useState("7")
  const [pounds, setPounds] = useState("143")

  const result = useMemo(() => {
    const height =
      unit === "metric"
        ? parseFloat(heightCm)
        : feetInchesToCm(parseFloat(feet) || 0, parseFloat(inches) || 0)
    const weight = unit === "metric" ? parseFloat(weightKg) : lbToKg(parseFloat(pounds))

    const computed = computeBmi(height, weight)
    if (!computed) return null

    return {
      ...computed,
      category: t(CATEGORY_KEY[computed.category]),
      categoryKey: computed.category,
    }
  }, [feet, heightCm, inches, pounds, t, unit, weightKg])

  const formatWeight = (kg: number) =>
    unit === "metric" ? `${kg.toFixed(1)} kg` : `${kgToLb(kg).toFixed(1)} lb`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-6 space-y-5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={unit === "metric" ? "default" : "outline"}
              onClick={() => setUnit("metric")}
            >
              {t("metric")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={unit === "imperial" ? "default" : "outline"}
              onClick={() => setUnit("imperial")}
            >
              {t("imperial")}
            </Button>
          </div>

          {unit === "metric" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="h-4 w-4 text-sky-500" />
                  {t("heightImperial")}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Input type="number" min="0" step="1" value={feet} onChange={(e) => setFeet(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("feet")}</p>
                  </div>
                  <div className="space-y-1">
                    <Input type="number" min="0" step="0.1" value={inches} onChange={(e) => setInches(e.target.value)} />
                    <p className="text-xs text-muted-foreground">{t("inches")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Scale className="h-4 w-4 text-emerald-500" />
                  {t("weightImperial")}
                </Label>
                <Input type="number" min="0" step="0.1" value={pounds} onChange={(e) => setPounds(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t("poundsHint")}</p>
              </div>
            </>
          )}

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

          <GlassCard className="p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("gaugeTitle")}</p>
            <div className="relative mt-4">
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {GAUGE_BANDS.map((band) => (
                  <div key={band.className} className={band.className} style={{ flex: band.flex }} />
                ))}
              </div>
              {result ? (
                <div
                  className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-background"
                  style={{ left: `${gaugePosition(result.bmi) * 100}%` }}
                />
              ) : null}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{t("underweight")}</span>
              <span>{t("normal")}</span>
              <span>{t("overweight")}</span>
              <span>{t("obesity")}</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-violet-500/20 sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3">
                <HeartPulse className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("healthyRange")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-violet-500">
                  {result ? `${formatWeight(result.healthyMinKg)} – ${formatWeight(result.healthyMaxKg)}` : "-"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result
                    ? t("healthyRangeSummaryUnit", {
                        min: formatWeight(result.healthyMinKg),
                        max: formatWeight(result.healthyMaxKg),
                      })
                    : t("invalidInput")}
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
