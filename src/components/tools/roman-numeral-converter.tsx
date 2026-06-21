"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowRightLeft, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { ROMAN_MAX, ROMAN_MIN, fromRoman, toRoman } from "./roman-numeral-converter.utils"

const REFERENCE: Array<[string, number]> = [
  ["I", 1],
  ["V", 5],
  ["X", 10],
  ["L", 50],
  ["C", 100],
  ["D", 500],
  ["M", 1000],
]

export function RomanNumeralConverter() {
  const t = useTranslations("RomanNumeralConverter")
  const [number, setNumber] = useState("2024")
  const [roman, setRoman] = useState("MMXXIV")
  const [numberError, setNumberError] = useState<string | null>(null)
  const [romanError, setRomanError] = useState<string | null>(null)

  const onNumberChange = (value: string) => {
    setNumber(value)
    if (value.trim() === "") {
      setNumberError(null)
      setRoman("")
      return
    }
    const parsed = Number(value)
    if (!Number.isInteger(parsed)) {
      setNumberError(t("errorNotInteger"))
      setRoman("")
      return
    }
    if (parsed < ROMAN_MIN || parsed > ROMAN_MAX) {
      setNumberError(t("errorRange"))
      setRoman("")
      return
    }
    setNumberError(null)
    setRomanError(null)
    setRoman(toRoman(parsed) ?? "")
  }

  const onRomanChange = (value: string) => {
    const upper = value.toUpperCase()
    setRoman(upper)
    if (upper.trim() === "") {
      setRomanError(null)
      setNumber("")
      return
    }
    const result = fromRoman(upper)
    if (result === null) {
      setRomanError(t("errorInvalidRoman"))
      setNumber("")
      return
    }
    setRomanError(null)
    setNumberError(null)
    setNumber(String(result))
  }

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>{t("number")}</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={ROMAN_MIN}
              max={ROMAN_MAX}
              value={number}
              onChange={(event) => onNumberChange(event.target.value)}
              className="text-lg font-mono"
              placeholder="1 – 3999"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => copy(number)} aria-label={t("copy")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {numberError && <p className="text-sm text-red-500">{numberError}</p>}
        </div>

        <div className="flex justify-center text-muted-foreground">
          <ArrowRightLeft className="h-5 w-5" />
        </div>

        <div className="space-y-2">
          <Label>{t("roman")}</Label>
          <div className="flex gap-2">
            <Input
              value={roman}
              onChange={(event) => onRomanChange(event.target.value)}
              className="text-lg font-mono tracking-widest"
              placeholder="MMXXIV"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => copy(roman)} aria-label={t("copy")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {romanError && <p className="text-sm text-red-500">{romanError}</p>}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <p className="text-sm font-medium">{t("referenceTitle")}</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {REFERENCE.map(([symbol, value]) => (
            <div key={symbol} className="rounded-xl border border-border/50 bg-muted/20 p-3 text-center">
              <p className="text-lg font-black font-mono tracking-widest">{symbol}</p>
              <p className="mt-1 text-xs text-muted-foreground">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <p className="text-center text-xs text-muted-foreground">{t("rangeNote")}</p>
    </div>
  )
}
