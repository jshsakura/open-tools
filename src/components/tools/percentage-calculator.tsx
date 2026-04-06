"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRightLeft, Calculator, Percent, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PercentageCalculatorTool() {
  const t = useTranslations("PercentageCalculator")
  const [percent, setPercent] = useState("20")
  const [baseValue, setBaseValue] = useState("85")
  const [oldValue, setOldValue] = useState("120")
  const [newValue, setNewValue] = useState("96")

  const percentageResult = useMemo(() => {
    const percentValue = parseFloat(percent)
    const base = parseFloat(baseValue)

    if (!Number.isFinite(percentValue) || !Number.isFinite(base)) {
      return null
    }

    return (percentValue / 100) * base
  }, [baseValue, percent])

  const changeResult = useMemo(() => {
    const previous = parseFloat(oldValue)
    const next = parseFloat(newValue)

    if (!Number.isFinite(previous) || !Number.isFinite(next) || previous === 0) {
      return null
    }

    const difference = next - previous
    const percentChange = (difference / previous) * 100

    return {
      difference,
      percentChange,
      isIncrease: difference >= 0,
    }
  }, [newValue, oldValue])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">{t("basicTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("percent")}</Label>
              <Input type="number" step="0.1" value={percent} onChange={(e) => setPercent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("baseValue")}</Label>
              <Input type="number" step="0.01" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} />
            </div>
          </div>

          <GlassCard className="p-4 border-emerald-500/20">
            <p className="text-sm text-muted-foreground">{t("result")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">
              {percentageResult !== null ? percentageResult.toFixed(2) : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("basicSummary", { percent: percent || "0", value: baseValue || "0" })}
            </p>
          </GlassCard>
        </GlassCard>

        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-sky-500" />
            <h3 className="font-semibold">{t("changeTitle")}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("oldValue")}</Label>
              <Input type="number" step="0.01" value={oldValue} onChange={(e) => setOldValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("newValue")}</Label>
              <Input type="number" step="0.01" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-4 border-sky-500/20">
              <p className="text-sm text-muted-foreground">{t("difference")}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
                {changeResult ? changeResult.difference.toFixed(2) : "-"}
              </p>
            </GlassCard>
            <GlassCard className="p-4 border-violet-500/20">
              <p className="text-sm text-muted-foreground">{t("percentChange")}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">
                {changeResult ? `${changeResult.percentChange.toFixed(1)}%` : "-"}
              </p>
            </GlassCard>
          </div>

          <GlassCard className="p-4 border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2">
                {changeResult?.isIncrease ? <TrendingUp className="h-5 w-5 text-amber-500" /> : <Calculator className="h-5 w-5 text-amber-500" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("changeSummaryTitle")}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {changeResult ? t("changeSummary", {
                    direction: changeResult.isIncrease ? t("increase") : t("decrease"),
                    percent: Math.abs(changeResult.percentChange).toFixed(1),
                  }) : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </GlassCard>
      </div>
    </div>
  )
}
