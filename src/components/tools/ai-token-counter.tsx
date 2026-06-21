"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MODEL_RATES, cost, estimateTokens } from "./ai-token-counter.utils"

const DEFAULT_OUTPUT_TOKENS = 500

export function AiTokenCounter() {
  const t = useTranslations("AiTokenCounter.ui")
  const [text, setText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [expectedOutput, setExpectedOutput] = useState<number>(DEFAULT_OUTPUT_TOKENS)
  const [modelId, setModelId] = useState(MODEL_RATES[0].id)

  const rate = MODEL_RATES.find((m) => m.id === modelId) ?? MODEL_RATES[0]

  const charCount = text.length
  const inputTokens = estimateTokens(text)
  // Output tokens: use the estimate from sample output text if present,
  // otherwise fall back to the editable expected-output length.
  const estimatedOutputTokens = outputText.trim()
    ? estimateTokens(outputText)
    : Math.max(0, expectedOutput || 0)

  const inputCost = cost(inputTokens, rate.inputPerM)
  const outputCost = cost(estimatedOutputTokens, rate.outputPerM)
  const totalCost = inputCost + outputCost

  const fmt = (value: number) => `$${value.toFixed(6)}`

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{t("modelSelect")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {MODEL_RATES.map((m) => (
            <Button
              key={m.id}
              variant={modelId === m.id ? "default" : "outline"}
              onClick={() => setModelId(m.id)}
              className="flex-1 min-w-[120px] font-semibold text-xs py-1"
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("inputLabel")}</label>
            <Textarea
              placeholder={t("inputPlaceholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px] bg-background/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("outputLabel")}</label>
            <Textarea
              placeholder={t("outputPlaceholder")}
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              className="min-h-[180px] bg-background/50"
            />
          </div>
        </div>

        {!outputText.trim() && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">{t("expectedOutput")}</label>
            <Input
              type="number"
              min={0}
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(Math.max(0, Number(e.target.value) || 0))}
              className="w-32 bg-background/50"
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("charCount")}</p>
              <p className="text-xl font-bold text-primary mt-1">{charCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("inputTokens")}</p>
              <p className="text-xl font-bold text-primary mt-1">{inputTokens}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("outputTokens")}</p>
              <p className="text-xl font-bold text-primary mt-1">{estimatedOutputTokens}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("inputCost")}</p>
              <p className="text-lg font-bold text-primary mt-1">{fmt(inputCost)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("outputCost")}</p>
              <p className="text-lg font-bold text-primary mt-1">{fmt(outputCost)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("totalCost")}</p>
              <p className="text-lg font-bold text-primary mt-1">{fmt(totalCost)}</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">{t("estimateNote")}</p>
      </CardContent>
    </Card>
  )
}
