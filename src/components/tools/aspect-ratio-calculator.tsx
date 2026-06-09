"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function AspectRatioCalculator() {
  const t = useTranslations("AspectRatioCalculator")
  const [ratioW, setRatioW] = useState(16)
  const [ratioH, setRatioH] = useState(9)
  const [width, setWidth] = useState(1920)
  const [height, setHeight] = useState(1080)

  const updateRatio = (w: number, h: number) => {
    setRatioW(w)
    setRatioH(h)
    if (w > 0) setHeight(Math.round((width * h) / w))
  }

  const onWidthChange = (value: number) => {
    setWidth(value)
    if (ratioW > 0) setHeight(Math.round((value * ratioH) / ratioW))
  }

  const onHeightChange = (value: number) => {
    setHeight(value)
    if (ratioH > 0) setWidth(Math.round((value * ratioW) / ratioH))
  }

  const divisor = gcd(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)))
  const simplified = `${Math.round(width / divisor)} : ${Math.round(height / divisor)}`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <Label className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t("ratio")}
        </Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            value={ratioW}
            onChange={(event) => updateRatio(Number(event.target.value), ratioH)}
            className="font-mono"
          />
          <span className="text-xl font-bold text-muted-foreground">:</span>
          <Input
            type="number"
            min={1}
            value={ratioH}
            onChange={(event) => updateRatio(ratioW, Number(event.target.value))}
            className="font-mono"
          />
        </div>
      </GlassCard>

      <GlassCard className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("width")}</Label>
          <Input
            type="number"
            min={1}
            value={width}
            onChange={(event) => onWidthChange(Number(event.target.value))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("height")}</Label>
          <Input
            type="number"
            min={1}
            value={height}
            onChange={(event) => onHeightChange(Number(event.target.value))}
            className="font-mono"
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("simplified")}</p>
        <p className="text-3xl font-black">{simplified}</p>
      </GlassCard>
    </div>
  )
}
