"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard, Shuffle } from "lucide-react"
import { toast } from "sonner"

export function SvgShapesGenerator() {
  const t = useTranslations("SvgShapesGenerator.ui")
  const [complexity, setComplexity] = useState(3)
  const [color, setColor] = useState("#8b5cf6")
  const [seed, setSeed] = useState(0.5)

  // Math calculation for a smooth bezier path blob
  const generateBlobPath = () => {
    const size = 200
    const points = []
    const step = (Math.PI * 2) / 6
    for (let i = 0; i < 6; i++) {
      const angle = i * step
      const r = size * 0.4 + Math.sin(angle * complexity + seed * 10) * size * 0.1
      const x = size / 2 + Math.cos(angle) * r
      const y = size / 2 + Math.sin(angle) * r
      points.push({ x, y })
    }

    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length]
      const curr = points[i]
      const xc = (curr.x + next.x) / 2
      const yc = (curr.y + next.y) / 2
      d += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`
    }
    return d + " Z"
  }

  const pathD = generateBlobPath()
  const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <path d="${pathD}" fill="${color}" />
</svg>`

  const handleRandomize = () => {
    setSeed(Math.random())
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(svgCode)
    toast.success(t("copySvg"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("complexity")}: {complexity}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("colorSelect")}</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
            />
          </div>
          <Button onClick={handleRandomize} variant="outline" size="sm" className="gap-1.5">
            <Shuffle className="w-3.5 h-3.5" />
            {t("randomize")}
          </Button>
          <div className="flex items-center justify-center rounded-lg bg-muted/40 border border-border/60 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="w-40 h-40"
              aria-hidden="true"
            >
              <path d={pathD} fill={color} />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Generated SVG</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("copySvg")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
            {svgCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
