"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"

const MAX_REPEAT = 10000
const COPY_RESET_MS = 2000

const SEPARATORS: Record<string, string> = {
  newline: "\n",
  space: " ",
  comma: ", ",
  none: "",
}

export function TextRepeater() {
  const t = useTranslations("TextRepeater")
  const [text, setText] = useState("")
  const [count, setCount] = useState(5)
  const [separator, setSeparator] = useState<keyof typeof SEPARATORS>("newline")
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    if (!text) return ""
    const safeCount = Math.max(1, Math.min(MAX_REPEAT, Math.floor(count) || 1))
    return Array.from({ length: safeCount }, () => text).join(SEPARATORS[separator])
  }, [text, count, separator])

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy repeated text:", error)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="space-y-2">
          <Label>{t("text")}</Label>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("placeholder")}
            className="min-h-[100px]"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("count")}</Label>
            <Input
              type="number"
              min={1}
              max={MAX_REPEAT}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("separator")}</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SEPARATORS) as Array<keyof typeof SEPARATORS>).map(
                (key) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={separator === key ? "default" : "outline"}
                    onClick={() => setSeparator(key)}
                  >
                    {t(`sep_${key}`)}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Label>{t("result")}</Label>
          <Button size="sm" onClick={handleCopy} disabled={!output}>
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
          value={output}
          className="min-h-[200px] font-mono text-sm"
          aria-label={t("result")}
        />
      </GlassCard>
    </div>
  )
}
