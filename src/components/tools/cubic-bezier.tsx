"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Play, Spline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import {
  BEZIER_PRESETS,
  type BezierValue,
  clampX,
  clampY,
  formatBezier,
  bezierToCss,
} from "./cubic-bezier.utils"

const SIZE = 240
const PAD = 24
const Y_MAX = 1.5
const Y_MIN = -0.5
const VBW = SIZE + PAD * 2
const VBH = (Y_MAX - Y_MIN) * SIZE + PAD * 2

const MIN_DURATION = 200
const MAX_DURATION = 3000
const DEFAULT_DURATION = 1000
const COPY_RESET_MS = 2000

const toX = (x: number) => PAD + x * SIZE
const toY = (y: number) => PAD + (Y_MAX - y) * SIZE

export function CubicBezier() {
  const t = useTranslations("CubicBezier")
  const svgRef = useRef<SVGSVGElement>(null)
  const [value, setValue] = useState<BezierValue>([0.25, 0.1, 0.25, 1])
  const [dragging, setDragging] = useState<1 | 2 | null>(null)
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [animating, setAnimating] = useState(false)
  const [copied, setCopied] = useState(false)

  const [x1, y1, x2, y2] = value

  const updateFromPointer = useCallback(
    (handle: 1 | 2, clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const svgX = ((clientX - rect.left) / rect.width) * VBW
      const svgY = ((clientY - rect.top) / rect.height) * VBH
      const x = clampX((svgX - PAD) / SIZE)
      const y = clampY(Y_MAX - (svgY - PAD) / SIZE)
      setValue((prev) =>
        handle === 1 ? [x, y, prev[2], prev[3]] : [prev[0], prev[1], x, y],
      )
    },
    [],
  )

  const handlePointerDown = (handle: 1 | 2) => (event: React.PointerEvent) => {
    event.preventDefault()
    setDragging(handle)
    ;(event.target as Element).setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging) return
    updateFromPointer(dragging, event.clientX, event.clientY)
  }

  const handlePointerUp = () => setDragging(null)

  const play = () => {
    setAnimating(false)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimating(true)),
    )
  }

  const cssLine = bezierToCss(value)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssLine)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy cubic-bezier CSS:", error)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {BEZIER_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => setValue(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GlassCard className="flex items-center justify-center p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VBW} ${VBH}`}
            className="w-full max-w-[320px] touch-none select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* unit square */}
            <rect
              x={toX(0)}
              y={toY(1)}
              width={SIZE}
              height={SIZE}
              className="fill-muted/20 stroke-border"
              strokeWidth={1}
            />
            {/* baseline + top guides */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(1)}
              y2={toY(0)}
              className="stroke-border/60"
              strokeDasharray="4 4"
            />
            {/* control handle lines */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(x1)}
              y2={toY(y1)}
              className="stroke-violet-400"
              strokeWidth={2}
            />
            <line
              x1={toX(1)}
              y1={toY(1)}
              x2={toX(x2)}
              y2={toY(y2)}
              className="stroke-fuchsia-400"
              strokeWidth={2}
            />
            {/* the bezier curve */}
            <path
              d={`M ${toX(0)} ${toY(0)} C ${toX(x1)} ${toY(y1)}, ${toX(x2)} ${toY(y2)}, ${toX(1)} ${toY(1)}`}
              className="fill-none stroke-primary"
              strokeWidth={3}
            />
            {/* anchor points */}
            <circle cx={toX(0)} cy={toY(0)} r={4} className="fill-foreground" />
            <circle cx={toX(1)} cy={toY(1)} r={4} className="fill-foreground" />
            {/* draggable control handles */}
            <circle
              cx={toX(x1)}
              cy={toY(y1)}
              r={9}
              className="cursor-grab fill-violet-500 active:cursor-grabbing"
              onPointerDown={handlePointerDown(1)}
            />
            <circle
              cx={toX(x2)}
              cy={toY(y2)}
              r={9}
              className="cursor-grab fill-fuchsia-500 active:cursor-grabbing"
              onPointerDown={handlePointerDown(2)}
            />
          </svg>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between gap-4 p-6">
          <div className="space-y-3">
            <Label>{t("previewLabel")}</Label>
            <div className="relative h-3 w-full rounded-full bg-muted">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-primary shadow"
                style={{
                  left: animating ? "calc(100% - 1.25rem)" : "0px",
                  transitionProperty: "left",
                  transitionDuration: `${duration}ms`,
                  transitionTimingFunction: formatBezier(value),
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t("duration")}: {duration}ms
            </Label>
            <Slider
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={100}
              value={[duration]}
              onValueChange={([next]) => setDuration(next)}
              className="mt-3"
            />
          </div>

          <Button variant="outline" onClick={play} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            {t("play")}
          </Button>
        </GlassCard>
      </div>

      <GlassCard className="flex items-center justify-between gap-4 p-4">
        <code className="overflow-x-auto font-mono text-sm">{formatBezier(value)}</code>
        <Button size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? t("copied") : t("copy")}
        </Button>
      </GlassCard>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spline className="h-3.5 w-3.5" />
        {t("privacyNote")}
      </div>
    </div>
  )
}
