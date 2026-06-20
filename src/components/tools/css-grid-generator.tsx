"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"

export function CssGridGenerator() {
  const t = useTranslations("CssGridGenerator.ui")
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [gap, setGap] = useState(16)

  const cssCode = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  gap: ${gap}px;
}`

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("rows")}: {rows}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("cols")}: {cols}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("gap")}: {gap}px
            </label>
            <input
              type="range"
              min="0"
              max="40"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Generated CSS</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(cssCode)}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("codeExport")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all">
            {cssCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}