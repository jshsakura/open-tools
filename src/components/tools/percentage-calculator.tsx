"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRightLeft, Calculator, Divide, Percent, TrendingUp } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  percentOf,
  whatPercent,
  percentageChange,
  adjustByPercent,
} from "./percentage-calculator.utils"

type Mode = "basic" | "ofWhich" | "change" | "adjust"

const MODES: { id: Mode; labelKey: string; icon: typeof Percent }[] = [
  { id: "basic", labelKey: "modeBasic", icon: Percent },
  { id: "ofWhich", labelKey: "modeOfWhich", icon: Divide },
  { id: "change", labelKey: "modeChange", icon: ArrowRightLeft },
  { id: "adjust", labelKey: "modeAdjust", icon: TrendingUp },
]

export function PercentageCalculatorTool() {
  const t = useTranslations("PercentageCalculator")
  const [mode, setMode] = useState<Mode>("basic")

  // basic: P% of B
  const [percent, setPercent] = useState("20")
  const [baseValue, setBaseValue] = useState("85")
  // ofWhich: A is what % of B
  const [partValue, setPartValue] = useState("25")
  const [wholeValue, setWholeValue] = useState("200")
  // change: old -> new
  const [oldValue, setOldValue] = useState("120")
  const [newValue, setNewValue] = useState("96")
  // adjust: increase/decrease N by X%
  const [adjustValue, setAdjustValue] = useState("200")
  const [adjustPercent, setAdjustPercent] = useState("15")

  const basicResult = useMemo(
    () => percentOf(parseFloat(percent), parseFloat(baseValue)),
    [baseValue, percent],
  )
  const ofWhichResult = useMemo(
    () => whatPercent(parseFloat(partValue), parseFloat(wholeValue)),
    [partValue, wholeValue],
  )
  const changeResult = useMemo(
    () => percentageChange(parseFloat(oldValue), parseFloat(newValue)),
    [newValue, oldValue],
  )
  const adjustResult = useMemo(
    () => adjustByPercent(parseFloat(adjustValue), parseFloat(adjustPercent)),
    [adjustPercent, adjustValue],
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ id, labelKey, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={mode === id ? "default" : "outline"}
            onClick={() => setMode(id)}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </Button>
        ))}
      </div>

      {mode === "basic" && (
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
              {basicResult !== null ? basicResult.toFixed(2) : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("basicSummary", { percent: percent || "0", value: baseValue || "0" })}
            </p>
          </GlassCard>
        </GlassCard>
      )}

      {mode === "ofWhich" && (
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Divide className="h-5 w-5 text-sky-500" />
            <h3 className="font-semibold">{t("ofWhichTitle")}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("partValue")}</Label>
              <Input type="number" step="0.01" value={partValue} onChange={(e) => setPartValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("wholeValue")}</Label>
              <Input type="number" step="0.01" value={wholeValue} onChange={(e) => setWholeValue(e.target.value)} />
            </div>
          </div>
          <GlassCard className="p-4 border-sky-500/20">
            <p className="text-sm text-muted-foreground">{t("result")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {ofWhichResult !== null ? `${ofWhichResult.toFixed(2)}%` : "-"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {ofWhichResult !== null
                ? t("ofWhichSummary", { part: partValue || "0", whole: wholeValue || "0" })
                : t("invalidInput")}
            </p>
          </GlassCard>
        </GlassCard>
      )}

      {mode === "change" && (
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
                  {changeResult
                    ? t("changeSummary", {
                        direction: changeResult.isIncrease ? t("increase") : t("decrease"),
                        percent: Math.abs(changeResult.percentChange).toFixed(1),
                      })
                    : t("invalidInput")}
                </p>
              </div>
            </div>
          </GlassCard>
        </GlassCard>
      )}

      {mode === "adjust" && (
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">{t("adjustTitle")}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("adjustValue")}</Label>
              <Input type="number" step="0.01" value={adjustValue} onChange={(e) => setAdjustValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("adjustPercent")}</Label>
              <Input type="number" step="0.1" value={adjustPercent} onChange={(e) => setAdjustPercent(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t("adjustHint")}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-4 border-emerald-500/20">
              <p className="text-sm text-muted-foreground">{t("result")}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-emerald-500">
                {adjustResult ? adjustResult.result.toFixed(2) : "-"}
              </p>
            </GlassCard>
            <GlassCard className="p-4 border-violet-500/20">
              <p className="text-sm text-muted-foreground">{t("adjustDelta")}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-violet-500">
                {adjustResult ? adjustResult.delta.toFixed(2) : "-"}
              </p>
            </GlassCard>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
