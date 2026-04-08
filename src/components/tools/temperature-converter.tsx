"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Snowflake, Thermometer, Waves } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TemperatureUnit = "C" | "F" | "K"

function toCelsius(value: number, unit: TemperatureUnit) {
  if (unit === "C") return value
  if (unit === "F") return (value - 32) * (5 / 9)
  return value - 273.15
}

function fromCelsius(value: number, unit: TemperatureUnit) {
  if (unit === "C") return value
  if (unit === "F") return (value * 9) / 5 + 32
  return value + 273.15
}

export function TemperatureConverterTool() {
  const t = useTranslations("TemperatureConverter")
  const [value, setValue] = useState("25")
  const [fromUnit, setFromUnit] = useState<TemperatureUnit>("C")
  const [toUnit, setToUnit] = useState<TemperatureUnit>("F")

  const result = useMemo(() => {
    const parsedValue = Number.parseFloat(value)

    if (!Number.isFinite(parsedValue)) {
      return null
    }

    const celsius = toCelsius(parsedValue, fromUnit)
    const converted = fromCelsius(celsius, toUnit)

    return {
      converted,
      freezing: fromCelsius(0, toUnit),
      boiling: fromCelsius(100, toUnit),
    }
  }, [fromUnit, toUnit, value])

  const formatTemperature = (input: number) => input.toLocaleString(undefined, { maximumFractionDigits: 2 })

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fromUnit")}</Label>
              <Select value={fromUnit} onValueChange={(unit: TemperatureUnit) => setFromUnit(unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">{t("units.C")}</SelectItem>
                  <SelectItem value="F">{t("units.F")}</SelectItem>
                  <SelectItem value="K">{t("units.K")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("toUnit")}</Label>
              <Select value={toUnit} onValueChange={(unit: TemperatureUnit) => setToUnit(unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">{t("units.C")}</SelectItem>
                  <SelectItem value="F">{t("units.F")}</SelectItem>
                  <SelectItem value="K">{t("units.K")}</SelectItem>
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
