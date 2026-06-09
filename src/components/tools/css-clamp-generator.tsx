"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { buildClamp } from "./css-clamp-generator.utils"

const COPY_RESET_MS = 2000
const DEFAULT_ROOT = 16

export function CssClampGenerator() {
  const t = useTranslations("CssClampGenerator")
  const [minViewport, setMinViewport] = useState(320)
  const [maxViewport, setMaxViewport] = useState(1280)
  const [minSize, setMinSize] = useState(16)
  const [maxSize, setMaxSize] = useState(32)
  const [copied, setCopied] = useState(false)

  const clamp = useMemo(
    () =>
      buildClamp({
        minViewport,
        maxViewport,
        minSize,
        maxSize,
        rootFontSize: DEFAULT_ROOT,
      }),
    [minViewport, maxViewport, minSize, maxSize],
  )

  const cssLine = clamp ? `font-size: ${clamp};` : ""

  const handleCopy = async () => {
    if (!cssLine) return
    try {
      await navigator.clipboard.writeText(cssLine)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy clamp CSS:", error)
    }
  }

  const fields: Array<[string, number, (value: number) => void]> = [
    [t("minViewport"), minViewport, setMinViewport],
    [t("maxViewport"), maxViewport, setMaxViewport],
    [t("minSize"), minSize, setMinSize],
    [t("maxSize"), maxSize, setMaxSize],
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {fields.map(([label, value, setter]) => (
          <div key={label} className="space-y-2">
            <Label>{label} (px)</Label>
            <Input
              type="number"
              value={value}
              onChange={(event) => setter(Number(event.target.value))}
              className="font-mono"
            />
          </div>
        ))}
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Label>{t("result")}</Label>
          <Button size="sm" onClick={handleCopy} disabled={!cssLine}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? t("copied") : t("copy")}
          </Button>
        </div>
        <code className="block overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
          {cssLine || t("invalid")}
        </code>
      </GlassCard>
    </div>
  )
}
