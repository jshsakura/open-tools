"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Database, Files, HardDrive } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SizeUnit = "B" | "KB" | "MB" | "GB" | "TB"

const DECIMAL_FACTORS: Record<SizeUnit, number> = {
  B: 1,
  KB: 1_000,
  MB: 1_000_000,
  GB: 1_000_000_000,
  TB: 1_000_000_000_000,
}

const BINARY_FACTORS: Record<SizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
}

export function FileSizeConverterTool() {
  const t = useTranslations("FileSizeConverter")
  const [value, setValue] = useState("250")
  const [fromUnit, setFromUnit] = useState<SizeUnit>("MB")
  const [toUnit, setToUnit] = useState<SizeUnit>("GB")

  const result = useMemo(() => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null

    const bytesDecimal = parsed * DECIMAL_FACTORS[fromUnit]
    const converted = bytesDecimal / DECIMAL_FACTORS[toUnit]
    const binaryReference = bytesDecimal / BINARY_FACTORS[toUnit]
    const decimalReference = converted

    return { converted, binaryReference, decimalReference }
  }, [fromUnit, toUnit, value])

  const formatValue = (input: number) => input.toLocaleString(undefined, { maximumFractionDigits: 4 })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-5 p-6">
          <div className="space-y-2"><Label>{t("value")}</Label><Input type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fromUnit")}</Label>
              <Select value={fromUnit} onValueChange={(unit: SizeUnit) => setFromUnit(unit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(DECIMAL_FACTORS).map((unit) => <SelectItem key={unit} value={unit}>{t(`units.${unit}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("toUnit")}</Label>
              <Select value={toUnit} onValueChange={(unit: SizeUnit) => setToUnit(unit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(DECIMAL_FACTORS).map((unit) => <SelectItem key={unit} value={unit}>{t(`units.${unit}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">{t("hint")}</div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5 sm:col-span-2"><p className="text-sm text-muted-foreground">{t("convertedValue")}</p><p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? `${formatValue(result.converted)} ${toUnit}` : "-"}</p></GlassCard>
          <GlassCard className="border-violet-500/20 p-5"><div className="flex items-start gap-3"><Database className="mt-1 h-5 w-5 text-violet-500" /><div><p className="text-sm text-muted-foreground">{t("binaryReference")}</p><p className="mt-2 text-2xl font-black tracking-tight text-violet-500">{result ? `${formatValue(result.binaryReference)} ${toUnit}` : "-"}</p></div></div></GlassCard>
          <GlassCard className="border-emerald-500/20 p-5"><div className="flex items-start gap-3"><HardDrive className="mt-1 h-5 w-5 text-emerald-500" /><div><p className="text-sm text-muted-foreground">{t("decimalReference")}</p><p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{result ? `${formatValue(result.decimalReference)} ${toUnit}` : "-"}</p></div></div></GlassCard>
          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2"><div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-500/10 p-3"><Files className="h-5 w-5 text-amber-500" /></div><div><p className="text-sm text-muted-foreground">{t("summaryTitle")}</p><p className="mt-2 text-sm font-medium leading-6">{result ? t("summary", { value: formatValue(Number.parseFloat(value || "0")), fromUnit, converted: formatValue(result.converted), toUnit }) : t("invalidInput")}</p></div></div></GlassCard>
        </div>
      </div>
    </div>
  )
}
