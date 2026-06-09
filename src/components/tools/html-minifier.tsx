"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import { minifyHtml } from "./html-minifier.utils"

const COPY_RESET_MS = 2000

export function HtmlMinifier() {
  const t = useTranslations("HtmlMinifier")
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => minifyHtml(input), [input])

  const handleCopy = async () => {
    if (!result.output) return
    try {
      await navigator.clipboard.writeText(result.output)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy minified HTML:", error)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard className="space-y-3 p-6">
        <Label>{t("input")}</Label>
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          className="min-h-[200px] font-mono text-sm"
        />
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {input
              ? t("saved", {
                  percent: result.savedPercent,
                  from: result.originalSize.toLocaleString(),
                  to: result.minifiedSize.toLocaleString(),
                })
              : t("hint")}
          </p>
          <Button size="sm" onClick={handleCopy} disabled={!result.output}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? t("copied") : t("copy")}
          </Button>
        </div>
        <Textarea
          readOnly
          value={result.output}
          className="min-h-[200px] font-mono text-sm"
          aria-label={t("output")}
        />
      </GlassCard>
    </div>
  )
}
