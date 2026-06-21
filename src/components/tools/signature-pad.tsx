"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Download, Eraser, PenTool, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  exportFileName,
  midPoint,
  type Background,
  type Point,
} from "./signature-pad.utils"

const CANVAS_WIDTH = 700
const CANVAS_HEIGHT = 300
const MIN_THICKNESS = 1
const MAX_THICKNESS = 20
const DEFAULT_THICKNESS = 3
const DEFAULT_COLOR = "#1e293b"

type Stroke = {
  color: string
  thickness: number
  points: Point[]
}

/** Draw one already-completed stroke with quadratic smoothing. */
function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const { points, color, thickness } = stroke
  if (points.length === 0) return

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = thickness
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  if (points.length === 1) {
    ctx.beginPath()
    ctx.arc(points[0].x, points[0].y, thickness / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const mid = midPoint(points[i], points[i + 1])
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y)
  }
  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

export function SignaturePad() {
  const t = useTranslations("SignaturePad")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [color, setColor] = useState(DEFAULT_COLOR)
  const [thickness, setThickness] = useState(DEFAULT_THICKNESS)
  const [background, setBackground] = useState<Background>("transparent")
  const [strokes, setStrokes] = useState<Stroke[]>([])

  // Live drawing state kept in refs so pointer handlers stay cheap and avoid
  // re-rendering on every move event.
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<Stroke | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (background === "white") {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    for (const stroke of strokes) drawStroke(ctx, stroke)
    if (currentStrokeRef.current) drawStroke(ctx, currentStrokeRef.current)
  }, [strokes, background])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    currentStrokeRef.current = { color, thickness, points: [getPoint(e)] }
    redraw()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    e.preventDefault()
    // Immutable update: replace the in-progress stroke with a new object.
    const prev = currentStrokeRef.current
    currentStrokeRef.current = {
      ...prev,
      points: [...prev.points, getPoint(e)],
    }
    redraw()
  }

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const finished = currentStrokeRef.current
    currentStrokeRef.current = null
    if (finished && finished.points.length > 0) {
      setStrokes((prev) => [...prev, finished])
    } else {
      redraw()
    }
  }

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    setStrokes([])
    currentStrokeRef.current = null
  }, [])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (strokes.length === 0) {
      toast.error(t("errors.empty"))
      return
    }

    try {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = url
      link.download = exportFileName("signature")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(t("downloaded"))
    } catch {
      toast.error(t("errors.exportFailed"))
    }
  }, [strokes.length, t])

  const isEmpty = strokes.length === 0

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_260px] gap-8">
        <GlassCard className="p-4">
          <div
            className={`rounded-lg overflow-hidden ${
              background === "transparent"
                ? "bg-[conic-gradient(#e5e7eb_90deg,transparent_90deg_180deg,#e5e7eb_180deg_270deg,transparent_270deg)] bg-[length:20px_20px]"
                : "bg-white"
            }`}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full touch-none cursor-crosshair"
              style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("canvasHint")}
          </p>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6 space-y-6 sticky top-6">
            <h3 className="font-bold flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary" />
              {t("controlsTitle")}
            </h3>

            {/* Pen color */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">{t("colorLabel")}</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label={t("colorLabel")}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 text-sm font-mono uppercase"
                />
              </div>
            </div>

            {/* Pen thickness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold">{t("thicknessLabel")}</Label>
                <span className="text-xs text-muted-foreground">{thickness}px</span>
              </div>
              <Slider
                value={[thickness]}
                onValueChange={(v) => setThickness(v[0])}
                min={MIN_THICKNESS}
                max={MAX_THICKNESS}
                step={1}
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">{t("backgroundLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["transparent", "white"] as Background[]).map((bg) => (
                  <Button
                    key={bg}
                    size="sm"
                    variant={background === bg ? "default" : "outline"}
                    onClick={() => setBackground(bg)}
                    className="text-xs"
                  >
                    {t(`background.${bg}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                disabled={isEmpty}
                className="text-xs gap-1"
              >
                <Undo2 className="w-3 h-3" />
                {t("undo")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                disabled={isEmpty}
                className="text-xs gap-1"
              >
                <Eraser className="w-3 h-3" />
                {t("clear")}
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full font-bold gap-2"
              onClick={handleDownload}
              disabled={isEmpty}
            >
              <Download className="w-4 h-4" />
              {t("download")}
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
