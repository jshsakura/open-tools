"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard, Shuffle, Download, Plus, X } from "lucide-react"
import { toast } from "sonner"

interface ColorStop {
  id: number
  value: string
  // Position of the radial source, in percent.
  x: number
  y: number
}

const PRESET_POSITIONS = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
  { x: 50, y: 50 },
  { x: 25, y: 75 },
]

const MIN_STOPS = 2
const MAX_STOPS = 8
const EXPORT_SIZE = 1200

let nextId = 100

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`
}

function buildGradientImage(stops: ColorStop[]): string {
  return stops
    .map((s) => `radial-gradient(at ${s.x}% ${s.y}%, ${s.value} 0px, transparent 50%)`)
    .join(",\n    ")
}

export function MeshGradientGenerator() {
  const t = useTranslations("MeshGradientGenerator.ui")
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, value: "#ff007f", x: 0, y: 0 },
    { id: 2, value: "#7f00ff", x: 100, y: 0 },
    { id: 3, value: "#00f5d4", x: 100, y: 100 },
    { id: 4, value: "#fee440", x: 0, y: 100 },
  ])
  const [animate, setAnimate] = useState(false)

  const baseColor = stops[0]?.value ?? "#000000"
  const gradientImage = buildGradientImage(stops)

  const previewStyle: React.CSSProperties = {
    backgroundColor: baseColor,
    backgroundImage: gradientImage,
    backgroundSize: animate ? "150% 150%" : undefined,
    animation: animate ? "mesh-gradient-shift 8s ease infinite" : undefined,
    minHeight: "220px",
    borderRadius: "8px",
  }

  const animationCss = animate
    ? `
  background-size: 150% 150%;
  animation: mesh-gradient-shift 8s ease infinite;
}
@keyframes mesh-gradient-shift {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`
    : "\n"

  const cssCode = `.mesh-gradient {
  background-color: ${baseColor};
  background-image:
    ${gradientImage};${animationCss}}`

  const updateStop = (id: number, value: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)))
  }

  const addStop = () => {
    if (stops.length >= MAX_STOPS) return
    const pos = PRESET_POSITIONS[stops.length % PRESET_POSITIONS.length]
    setStops((prev) => [...prev, { id: ++nextId, value: randomHex(), x: pos.x, y: pos.y }])
  }

  const removeStop = (id: number) => {
    if (stops.length <= MIN_STOPS) return
    setStops((prev) => prev.filter((s) => s.id !== id))
  }

  const handleRandomize = () => {
    setStops((prev) =>
      prev.map((s) => ({
        ...s,
        value: randomHex(),
        x: Math.round(Math.random() * 100),
        y: Math.round(Math.random() * 100),
      })),
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssCode)
    toast.success(t("copyCss"))
  }

  const handleExportPng = () => {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = EXPORT_SIZE
      canvas.height = EXPORT_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        toast.error(t("exportFailed"))
        return
      }
      ctx.fillStyle = baseColor
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE)
      // Approximate each radial-gradient stop on the canvas.
      stops.forEach((s) => {
        const cx = (s.x / 100) * EXPORT_SIZE
        const cy = (s.y / 100) * EXPORT_SIZE
        const radius = EXPORT_SIZE * 0.5
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, s.value)
        grad.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE)
      })
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `mesh-gradient-${Date.now()}.png`
      link.click()
    } catch {
      toast.error(t("exportFailed"))
    }
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {stops.map((stop, idx) => (
              <div key={stop.id}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("colorLabel")} {idx + 1}
                  </label>
                  {stops.length > MIN_STOPS && (
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      aria-label={t("removeColor")}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="color"
                  value={stop.value}
                  onChange={(e) => updateStop(stop.id, e.target.value)}
                  className="w-full h-10 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={addStop} variant="outline" size="sm" className="gap-1.5" disabled={stops.length >= MAX_STOPS}>
              <Plus className="w-3.5 h-3.5" />
              {t("addColor")}
            </Button>
            <Button onClick={handleRandomize} variant="outline" size="sm" className="gap-1.5">
              <Shuffle className="w-3.5 h-3.5" />
              {t("randomize")}
            </Button>
            <Button onClick={handleExportPng} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {t("exportPng")}
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="accent-primary"
            />
            {t("animate")}
          </label>
          <div style={previewStyle} className="border border-border/60 shadow-lg" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Generated CSS</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("copyCss")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
            {cssCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
