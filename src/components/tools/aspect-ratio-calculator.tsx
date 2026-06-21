"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Lock, Copy } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import {
  reduceRatio,
  solveHeight,
  solveWidth,
  toCssAspect,
  toTailwindAspect,
} from "./aspect-ratio-calculator.utils"

const PRESETS: ReadonlyArray<{ w: number; h: number }> = [
  { w: 16, h: 9 },
  { w: 4, h: 3 },
  { w: 1, h: 1 },
  { w: 21, h: 9 },
  { w: 3, h: 2 },
  { w: 9, h: 16 },
]

const MAX_PREVIEW = 240

export function AspectRatioCalculator() {
  const t = useTranslations("AspectRatioCalculator")
  const [ratioW, setRatioW] = useState(16)
  const [ratioH, setRatioH] = useState(9)
  const [width, setWidth] = useState(1920)
  const [height, setHeight] = useState(1080)

  const updateRatio = (w: number, h: number) => {
    setRatioW(w)
    setRatioH(h)
    const solved = solveHeight(width, { w, h })
    if (solved !== null) setHeight(solved)
  }

  const applyPreset = (w: number, h: number) => updateRatio(w, h)

  const onWidthChange = (value: number) => {
    setWidth(value)
    const solved = solveHeight(value, { w: ratioW, h: ratioH })
    if (solved !== null) setHeight(solved)
  }

  const onHeightChange = (value: number) => {
    setHeight(value)
    const solved = solveWidth(value, { w: ratioW, h: ratioH })
    if (solved !== null) setWidth(solved)
  }

  const reduced = reduceRatio(width, height)
  const simplified = reduced ? `${reduced.w} : ${reduced.h}` : "—"
  const cssOutput = toCssAspect(reduced)
  const tailwindOutput = toTailwindAspect(reduced)

  // Proportional preview box capped so neither side exceeds MAX_PREVIEW.
  const aspect = height > 0 ? width / height : 1
  const previewWidth = aspect >= 1 ? MAX_PREVIEW : MAX_PREVIEW * aspect
  const previewHeight = aspect >= 1 ? MAX_PREVIEW / aspect : MAX_PREVIEW

  const copy = (value: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    toast.success(t("copied"))
  }

  const isActivePreset = (w: number, h: number) => reduced?.w === w && reduced?.h === h

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <Label>{t("presets")}</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={`${preset.w}:${preset.h}`}
              variant={isActivePreset(preset.w, preset.h) ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(preset.w, preset.h)}
              className="font-mono"
            >
              {preset.w}:{preset.h}
            </Button>
          ))}
        </div>
      </GlassCard>

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

      <GlassCard className="flex flex-col items-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">{t("preview")}</p>
        <div className="flex h-[260px] w-full items-center justify-center rounded-lg bg-muted/20">
          <div
            className="flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-xl transition-all duration-300"
            style={{ width: `${previewWidth}px`, height: `${previewHeight}px` }}
          >
            {simplified}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("simplified")}</p>
        <p className="text-3xl font-black">{simplified}</p>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">CSS</span>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5" onClick={() => copy(cssOutput)}>
              <Copy className="h-3.5 w-3.5" />
              {t("copy")}
            </Button>
          </div>
          <pre className="rounded-md bg-muted px-3 py-2 text-xs font-mono">{cssOutput || "—"}</pre>
        </GlassCard>
        <GlassCard className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Tailwind</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5"
              onClick={() => copy(tailwindOutput)}
            >
              <Copy className="h-3.5 w-3.5" />
              {t("copy")}
            </Button>
          </div>
          <pre className="rounded-md bg-muted px-3 py-2 text-xs font-mono">{tailwindOutput || "—"}</pre>
        </GlassCard>
      </div>
    </div>
  )
}
