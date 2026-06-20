"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function AiTokenCounter() {
  const t = useTranslations("AiTokenCounter.ui")
  const [text, setText] = useState("")
  const [model, setModel] = useState("gpt-4o")

  // Simple token estimator
  const charCount = text.length
  const estTokens = Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3 + text.replace(/[\w\s]/g, "").length * 1.5)
  const rates: Record<string, { in: number; out: number }> = {
    "gpt-4o": { in: 5.0, out: 15.0 },
    "claude-3-5": { in: 3.0, out: 15.0 },
    "gemini-1-5": { in: 1.25, out: 5.0 }
  }
  const rate = rates[model] ?? { in: 0, out: 0 }
  const cost = ((estTokens * rate.in) / 1000000).toFixed(6)

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{t("modelSelect")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          {["gpt-4o", "claude-3-5", "gemini-1-5"].map((m) => (
            <Button
              key={m}
              variant={model === m ? "default" : "outline"}
              onClick={() => setModel(m)}
              className="flex-1 uppercase font-semibold text-xs py-1"
            >
              {m}
            </Button>
          ))}
        </div>
        <Textarea
          placeholder={t("inputPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] bg-background/50"
        />
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("charCount")}</p>
              <p className="text-xl font-bold text-primary mt-1">{charCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("tokenCount")}</p>
              <p className="text-xl font-bold text-primary mt-1">{estTokens}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t("estimateNote")}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">{t("costEstimate")}</p>
              <p className="text-xl font-bold text-primary mt-1">${cost}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}