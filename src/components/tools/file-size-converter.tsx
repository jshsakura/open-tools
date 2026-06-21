"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Database, Files, Gauge, HardDrive } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ALL_UNITS,
  type Base,
  type SizeUnit,
  convertSize,
  formatDuration,
  toBytes,
  transferSeconds,
} from "./file-size-converter.utils"

export function FileSizeConverterTool() {
  const t = useTranslations("FileSizeConverter")
  const [value, setValue] = useState("250")
  const [fromUnit, setFromUnit] = useState<SizeUnit>("MB")
  const [toUnit, setToUnit] = useState<SizeUnit>("GB")
  const [base, setBase] = useState<Base>("decimal")
  const [bandwidth, setBandwidth] = useState("100")

  const result = useMemo(() => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null

    const converted = convertSize(parsed, fromUnit, toUnit, base)
    const decimalValue = convertSize(parsed, fromUnit, toUnit, "decimal")
    const binaryValue = convertSize(parsed, fromUnit, toUnit, "binary")
    const bytes = toBytes(parsed, fromUnit, base)
    const seconds = transferSeconds(bytes, Number.parseFloat(bandwidth))

    return { converted, decimalValue, binaryValue, seconds }
  }, [bandwidth, base, fromUnit, toUnit, value])

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
                <SelectContent>{ALL_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{t(`units.${unit}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("toUnit")}</Label>
              <Select value={toUnit} onValueChange={(unit: SizeUnit) => setToUnit(unit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALL_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{t(`units.${unit}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("baseMode")}</Label>
            <Select value={base} onValueChange={(mode: Base) => setBase(mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">{t("baseDecimal")}</SelectItem>
                <SelectItem value="binary">{t("baseBinary")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("bandwidth")}</Label><Input type="number" min="0" step="0.1" value={bandwidth} onChange={(e) => setBandwidth(e.target.value)} /></div>
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">{t("hint")}</div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="border-sky-500/20 p-5 sm:col-span-2"><p className="text-sm text-muted-foreground">{t("convertedValue")}</p><p className="mt-2 text-3xl font-black tracking-tight text-sky-500">{result ? `${formatValue(result.converted)} ${toUnit}` : "-"}</p></GlassCard>
          <GlassCard className="border-violet-500/20 p-5"><div className="flex items-start gap-3"><Database className="mt-1 h-5 w-5 text-violet-500" /><div><p className="text-sm text-muted-foreground">{t("binaryReference")}</p><p className="mt-2 text-2xl font-black tracking-tight text-violet-500">{result ? `${formatValue(result.binaryValue)} ${toUnit}` : "-"}</p></div></div></GlassCard>
          <GlassCard className="border-emerald-500/20 p-5"><div className="flex items-start gap-3"><HardDrive className="mt-1 h-5 w-5 text-emerald-500" /><div><p className="text-sm text-muted-foreground">{t("decimalReference")}</p><p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{result ? `${formatValue(result.decimalValue)} ${toUnit}` : "-"}</p></div></div></GlassCard>
          <GlassCard className="border-rose-500/20 p-5 sm:col-span-2"><div className="flex items-start gap-3"><Gauge className="mt-1 h-5 w-5 text-rose-500" /><div><p className="text-sm text-muted-foreground">{t("transferTime")}</p><p className="mt-2 text-2xl font-black tracking-tight text-rose-500">{result && result.seconds !== null ? formatDuration(result.seconds) : "-"}</p><p className="mt-1 text-xs text-muted-foreground">{t("transferHint")}</p></div></div></GlassCard>
          <GlassCard className="border-amber-500/20 p-5 sm:col-span-2"><div className="flex items-start gap-4"><div className="rounded-2xl bg-amber-500/10 p-3"><Files className="h-5 w-5 text-amber-500" /></div><div><p className="text-sm text-muted-foreground">{t("summaryTitle")}</p><p className="mt-2 text-sm font-medium leading-6">{result ? t("summary", { value: formatValue(Number.parseFloat(value || "0")), fromUnit, converted: formatValue(result.converted), toUnit }) : t("invalidInput")}</p></div></div></GlassCard>
        </div>
      </div>
    </div>
  )
}
