"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { getContrast } from "./color-contrast-checker.utils"

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
        pass
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
      )}
    >
      <span className="font-medium">{label}</span>
      {pass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </div>
  )
}

export function ColorContrastChecker() {
  const t = useTranslations("ColorContrastChecker")
  const [foreground, setForeground] = useState("#1f2937")
  const [background, setBackground] = useState("#ffffff")

  const result = useMemo(
    () => getContrast(foreground, background),
    [foreground, background],
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>{t("foreground")}</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={foreground}
                onChange={(event) => setForeground(event.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent"
                aria-label={t("foreground")}
              />
              <Input
                value={foreground}
                onChange={(event) => setForeground(event.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("background")}</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent"
                aria-label={t("background")}
              />
              <Input
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard
          className="flex flex-col items-center justify-center gap-2 p-6"
          style={{ backgroundColor: background, color: foreground }}
        >
          <p className="text-2xl font-bold">{t("previewLarge")}</p>
          <p className="text-sm">{t("previewNormal")}</p>
        </GlassCard>
      </div>

      {result ? (
        <GlassCard className="space-y-4 p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t("ratio")}</p>
            <p className="text-4xl font-black">{result.ratio.toFixed(2)} : 1</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Badge pass={result.aaNormal} label={t("aaNormal")} />
            <Badge pass={result.aaLarge} label={t("aaLarge")} />
            <Badge pass={result.aaaNormal} label={t("aaaNormal")} />
            <Badge pass={result.aaaLarge} label={t("aaaLarge")} />
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 text-center text-sm text-muted-foreground">
          {t("invalid")}
        </GlassCard>
      )}
    </div>
  )
}
