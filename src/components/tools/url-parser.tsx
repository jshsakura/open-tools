"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function UrlParser() {
  const t = useTranslations("UrlParser.ui")
  const [url, setUrl] = useState("https://example.com/search?q=open+tools&category=developer&lang=ko")

  let parsedParams: Array<{ key: string; value: string }> = []
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.forEach((value, key) => {
      parsedParams.push({ key, value })
    })
  } catch (e) {
    // invalid url
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("urlInput")}</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} className="bg-background/50 font-mono text-sm" />
        </div>
        <div className="pt-4 border-t border-border/40 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground">{t("queryTable")}</h4>
          <div className="space-y-1.5">
            {parsedParams.map((p, i) => (
              <div key={i} className="flex gap-2 text-xs font-mono bg-muted/40 p-2 rounded border border-border/30">
                <span className="text-primary font-semibold">{p.key}</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-foreground">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}