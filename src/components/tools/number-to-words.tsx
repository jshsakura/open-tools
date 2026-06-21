"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy, SpellCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  toEnglishWords,
  toKoreanFormalAmount,
  toKoreanWords,
} from "./number-to-words.utils"

type Lang = "en" | "ko"

const MAX_SAFE = Number.MAX_SAFE_INTEGER

export function NumberToWords() {
  const t = useTranslations("NumberToWords")
  const [value, setValue] = useState("1234")
  const [lang, setLang] = useState<Lang>("en")
  const [ordinal, setOrdinal] = useState(false)
  const [currency, setCurrency] = useState(false)

  const trimmed = value.replaceAll(",", "").trim()
  const parsed = trimmed === "" ? NaN : Number(trimmed)
  const isValid =
    Number.isFinite(parsed) && Math.abs(parsed) <= MAX_SAFE

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(t("copied"))
  }

  // Build the result rows immutably based on language + toggles.
  const rows: Array<{ label: string; text: string }> = []
  if (isValid) {
    if (lang === "en") {
      rows.push({
        label: t("resultWords"),
        text: toEnglishWords(parsed, { ordinal, currency }),
      })
    } else {
      rows.push({ label: t("resultKorean"), text: toKoreanWords(parsed) })
      rows.push({
        label: t("resultFormal"),
        text: toKoreanFormalAmount(parsed),
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <SpellCheck className="h-7 w-7 text-cyan-500" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      <GlassCard className="p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-bold">{t("inputLabel")}</Label>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="1234"
            className="h-12 text-lg font-bold tabular-nums"
          />
          {!isValid && trimmed !== "" && (
            <p className="text-sm text-red-500">{t("errorInvalid")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold">{t("language")}</Label>
          <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("langEnglish")}</SelectItem>
              <SelectItem value="ko">{t("langKorean")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {lang === "en" && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={ordinal ? "default" : "outline"}
              onClick={() => setOrdinal((prev) => !prev)}
              className="text-sm"
            >
              {t("ordinalToggle")}
            </Button>
            <Button
              type="button"
              variant={currency ? "default" : "outline"}
              onClick={() => setCurrency((prev) => !prev)}
              className="text-sm"
            >
              {t("currencyToggle")}
            </Button>
          </div>
        )}
      </GlassCard>

      {rows.length > 0 && (
        <GlassCard className="p-6 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copy(row.text)}
                  aria-label={t("copy")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="rounded-lg bg-secondary/40 px-4 py-3 text-lg font-semibold leading-relaxed break-words">
                {row.text}
              </p>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  )
}
