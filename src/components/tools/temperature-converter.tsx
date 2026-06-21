"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeftRight, Snowflake, Thermometer, Waves } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { convertTemperature, fromCelsius, type DisplayUnit, type TemperatureUnit } from "./temperature-converter.utils"

const UNIT_OPTIONS: DisplayUnit[] = ["C", "F", "K", "R"]

/** Common reference temperatures expressed in Celsius, with an i18n label key. */
const REFERENCE_POINTS: { key: string; celsius: number }[] = [
  { key: "absoluteZero", celsius: -273.15 },
  { key: "freezing", celsius: 0 },
  { key: "fridge", celsius: 4 },
  { key: "roomTemp", celsius: 21 },
  { key: "bodyTemp", celsius: 37 },
  { key: "boiling", celsius: 100 },
  { key: "ovenModerate", celsius: 180 },
  { key: "ovenHot", celsius: 220 },
]

export function TemperatureConverterTool() {
  const t = useTranslations("TemperatureConverter")
  const [value, setValue] = useState("25")
  const [fromUnit, setFromUnit] = useState<DisplayUnit>("C")
  const [toUnit, setToUnit] = useState<DisplayUnit>("F")

  const result = useMemo(() => {
    const parsedValue = Number.parseFloat(value)
    // Rankine is a display-only output; conversions start from a base unit.
    const baseUnit: TemperatureUnit = fromUnit === "R" ? "C" : fromUnit
    const sourceValue = fromUnit === "R" ? (parsedValue - 491.67) * (5 / 9) : parsedValue

    const conversion = convertTemperature(sourceValue, baseUnit)
    if (!conversion) return null

    return {
      converted: conversion[toUnit],
      freezing: fromCelsius(0, toUnit),
      boiling: fromCelsius(100, toUnit),
    }
  }, [fromUnit, toUnit, value])

  const formatTemperature = (input: number) => input.toLocaleString(undefined, { maximumFractionDigits: 2 })

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="h-4 w-4 text-sky-500" />
              {t("value")}
            </Label>
            <Input type="number" step="0.1" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>{t("fromUnit")}</Label>
              <Select value={fromUnit} onValueChange={(unit: DisplayUnit) => setFromUnit(unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {t(`units.${unit}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon" onClick={swapUnits} aria-label={t("swap")} className="mb-0.5">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="flex-1 space-y-2">
              <Label>{t("toUnit")}</Label>
              <Select value={toUnit} onValueChange={(unit: DisplayUnit) => setToUnit(unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {t(`units.${unit}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("hint")}
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("convertedValue")}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-sky-500">
              {result ? `${formatTemperature(result.converted)} ${toUnit}` : "-"}
            </p>
          </GlassCard>

          <GlassCard className="border-cyan-500/20 p-5">
            <div className="flex items-start gap-3">
              <Snowflake className="mt-1 h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("freezingPoint")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-cyan-500">
                  {result ? `${formatTemperature(result.freezing)} ${toUnit}` : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-orange-500/20 p-5">
            <div className="flex items-start gap-3">
              <Waves className="mt-1 h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("boilingPoint")}</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-orange-500">
                  {result ? `${formatTemperature(result.boiling)} ${toUnit}` : "-"}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-violet-500/20 p-5 sm:col-span-2">
            <p className="text-sm font-medium">{t("referenceTitle")}</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">{t("refColLabel")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("units.C")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("units.F")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("units.K")}</th>
                  </tr>
                </thead>
                <tbody>
                  {REFERENCE_POINTS.map((ref) => (
                    <tr key={ref.key} className="border-t border-border/40">
                      <td className="px-3 py-2 text-left text-muted-foreground">{t(`reference.${ref.key}`)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatTemperature(ref.celsius)}</td>
                      <td className="px-3 py-2 text-right">{formatTemperature(fromCelsius(ref.celsius, "F"))}</td>
                      <td className="px-3 py-2 text-right">{formatTemperature(fromCelsius(ref.celsius, "K"))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard className="border-primary/20 p-5 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("summaryTitle")}</p>
            <p className="mt-2 text-sm font-medium leading-6">
              {result
                ? t("summary", {
                    value: formatTemperature(result.converted),
                    unit: toUnit,
                  })
                : t("invalidInput")}
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
