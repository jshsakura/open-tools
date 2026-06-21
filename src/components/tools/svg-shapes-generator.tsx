"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clipboard, Shuffle, Download, FileImage } from "lucide-react"
import { toast } from "sonner"
import {
  CANVAS_SIZE,
  generateShape,
  SHAPE_TYPES,
  type ShapeType,
} from "./svg-shapes-generator.utils"

const EXPORT_SIZE = 800
const GRADIENT_ID = "svgShapeGradient"

function buildFillSvg(
  paths: string[],
  fillMode: "solid" | "gradient",
  color: string,
  color2: string,
  useStroke: boolean,
  stroke: string,
): string {
  const fill = fillMode === "gradient" ? `url(#${GRADIENT_ID})` : color
  const strokeAttrs = useStroke ? ` stroke="${stroke}" stroke-width="3"` : ""
  const defs =
    fillMode === "gradient"
      ? `\n  <defs>\n    <linearGradient id="${GRADIENT_ID}" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="${color}" />\n      <stop offset="100%" stop-color="${color2}" />\n    </linearGradient>\n  </defs>`
      : ""
  const body = paths
    .map((d) => `  <path d="${d}" fill="${fill}"${strokeAttrs} />`)
    .join("\n")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}">${defs}\n${body}\n</svg>`
}

export function SvgShapesGenerator() {
  const t = useTranslations("SvgShapesGenerator.ui")
  const [shapeType, setShapeType] = useState<ShapeType>("blob")
  const [complexity, setComplexity] = useState(3)
  const [color, setColor] = useState("#8b5cf6")
  const [color2, setColor2] = useState("#ec4899")
  const [fillMode, setFillMode] = useState<"solid" | "gradient">("solid")
  const [useStroke, setUseStroke] = useState(false)
  const [stroke, setStroke] = useState("#1e1b4b")
  const [seed, setSeed] = useState(0.5)

  const { paths } = generateShape(shapeType, complexity, seed)
  const svgCode = buildFillSvg(paths, fillMode, color, color2, useStroke, stroke)

  const handleRandomize = () => setSeed(Math.random())

  const handleCopy = async () => {
    await navigator.clipboard.writeText(svgCode)
    toast.success(t("copySvg"))
  }

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `svg-shape-${Date.now()}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPng = () => {
    const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = EXPORT_SIZE
      canvas.height = EXPORT_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        toast.error(t("exportFailed"))
        URL.revokeObjectURL(url)
        return
      }
      ctx.drawImage(img, 0, 0, EXPORT_SIZE, EXPORT_SIZE)
      URL.revokeObjectURL(url)
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `svg-shape-${Date.now()}.png`
      link.click()
    }
    img.onerror = () => {
      toast.error(t("exportFailed"))
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const fillId = fillMode === "gradient" ? `url(#${GRADIENT_ID})` : color

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("shapeType")}
            </label>
            <Select value={shapeType} onValueChange={(v) => setShapeType(v as ShapeType)}>
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHAPE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`shape_${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("fillMode")}
            </label>
            <Select value={fillMode} onValueChange={(v) => setFillMode(v as "solid" | "gradient")}>
              <SelectTrigger className="w-full bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{t("fillSolid")}</SelectItem>
                <SelectItem value="gradient">{t("fillGradient")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                {t("colorSelect")}
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
            </div>
            {fillMode === "gradient" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {t("colorSelect2")}
                </label>
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={useStroke}
                onChange={(e) => setUseStroke(e.target.checked)}
                className="accent-primary"
              />
              {t("strokeToggle")}
            </label>
            {useStroke && (
              <input
                type="color"
                value={stroke}
                onChange={(e) => setStroke(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRandomize} variant="outline" size="sm" className="gap-1.5">
              <Shuffle className="w-3.5 h-3.5" />
              {t("randomize")}
            </Button>
            <Button onClick={handleDownloadSvg} variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {t("downloadSvg")}
            </Button>
            <Button onClick={handleDownloadPng} variant="outline" size="sm" className="gap-1.5">
              <FileImage className="w-3.5 h-3.5" />
              {t("downloadPng")}
            </Button>
          </div>

          <div className="flex items-center justify-center rounded-lg bg-muted/40 border border-border/60 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              className="w-40 h-40"
              aria-hidden="true"
            >
              {fillMode === "gradient" && (
                <defs>
                  <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color2} />
                  </linearGradient>
                </defs>
              )}
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={fillId}
                  stroke={useStroke ? stroke : "none"}
                  strokeWidth={useStroke ? 3 : 0}
                />
              ))}
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
