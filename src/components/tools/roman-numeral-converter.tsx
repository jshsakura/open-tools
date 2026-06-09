"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRightLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { ROMAN_MAX, fromRoman, toRoman } from "./roman-numeral-converter.utils"

export function RomanNumeralConverter() {
  const t = useTranslations("RomanNumeralConverter")
  const [number, setNumber] = useState("2024")
  const [roman, setRoman] = useState("MMXXIV")

  const onNumberChange = (value: string) => {
    setNumber(value)
    const parsed = Number(value)
    const result = Number.isNaN(parsed) ? null : toRoman(parsed)
    setRoman(result ?? "")
  }

  const onRomanChange = (value: string) => {
    setRoman(value.toUpperCase())
    const result = fromRoman(value)
    setNumber(result === null ? "" : String(result))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>{t("number")}</Label>
          <Input
            type="number"
            min={1}
            max={ROMAN_MAX}
            value={number}
            onChange={(event) => onNumberChange(event.target.value)}
            className="text-lg font-mono"
            placeholder="1 – 3999"
          />
        </div>

        <div className="flex justify-center text-muted-foreground">
          <ArrowRightLeft className="h-5 w-5" />
        </div>

        <div className="space-y-2">
          <Label>{t("roman")}</Label>
          <Input
            value={roman}
            onChange={(event) => onRomanChange(event.target.value)}
            className="text-lg font-mono tracking-widest"
            placeholder="MMXXIV"
          />
        </div>
      </GlassCard>

      <p className="text-center text-xs text-muted-foreground">{t("rangeNote")}</p>
    </div>
  )
}
