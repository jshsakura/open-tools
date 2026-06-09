"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Pilcrow, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { generateLorem, type LoremUnit } from "./lorem-ipsum.utils"

const UNITS: LoremUnit[] = ["paragraphs", "sentences", "words"]
const MAX_COUNT = 50
const COPY_RESET_MS = 2000

export function LoremIpsum() {
  const t = useTranslations("LoremIpsum")
  const [unit, setUnit] = useState<LoremUnit>("paragraphs")
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [seed, setSeed] = useState(1)
  const [copied, setCopied] = useState(false)

  const output = useMemo(
    () => generateLorem({ unit, count, startWithLorem }, seed),
    [unit, count, startWithLorem, seed],
  )

  const stats = useMemo(() => {
    const words = output.trim().split(/\s+/).filter(Boolean).length
    return { words, chars: output.length }
  }, [output])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy Lorem Ipsum text:", error)
    }
  }

  const handleRegenerate = () => setSeed((prev) => prev + 1)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GlassCard className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {UNITS.map((value) => (
            <Button
              key={value}
              variant={unit === value ? "default" : "outline"}
              onClick={() => setUnit(value)}
              className="w-full"
            >
              {t(`unit_${value}`)}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label>
            {t("amount")}: {count}
          </Label>
          <Slider
            min={1}
            max={MAX_COUNT}
            step={1}
            value={[count]}
            onValueChange={([value]) => setCount(value)}
            className="mt-3"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
          <Label htmlFor="start-with-lorem" className="cursor-pointer">
            {t("startWithLorem")}
          </Label>
          <Switch
            id="start-with-lorem"
            checked={startWithLorem}
            onCheckedChange={setStartWithLorem}
          />
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("wordsLabel")}: {stats.words.toLocaleString()} · {t("charsLabel")}:{" "}
            {stats.chars.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("regenerate")}
            </Button>
            <Button size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? t("copied") : t("copy")}
            </Button>
          </div>
        </div>

        <Textarea
          readOnly
          value={output}
          className={cn(
            "min-h-[280px] resize-y whitespace-pre-line font-mono text-sm leading-relaxed",
          )}
          aria-label={t("outputLabel")}
        />
      </GlassCard>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Pilcrow className="h-3.5 w-3.5" />
        {t("privacyNote")}
      </div>
    </div>
  )
}
