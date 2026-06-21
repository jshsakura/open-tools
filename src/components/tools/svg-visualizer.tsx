"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Trash2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  PenTool,
  Move,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import { describeSegment, parsePath } from "./svg-visualizer.utils"

export function SvgVisualizer() {
  const t = useTranslations("SvgVisualizer")
  const [d, setD] = useState("M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [zoom, setZoom] = useState(1)
  const [copied, setCopied] = useState(false)
  const [filled, setFilled] = useState(false)
  const [viewBox, setViewBox] = useState("0 0 200 200")

  const { segments, errors } = parsePath(d)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(d)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <path d="${d}" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
</svg>`
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `path-${Date.now()}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  {t("pathData")}
                </Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
                    {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {t("copy")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownloadSvg} className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    {t("downloadSvg")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setD("")} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t("clear")}
                  </Button>
                </div>
              </div>
              <Textarea
                value={d}
                onChange={(e) => setD(e.target.value)}
                placeholder="M 10 10 L 90 90..."
                className="min-h-[160px] font-mono text-sm bg-background/50 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("viewBox")}</Label>
                <Input
                  value={viewBox}
                  onChange={(e) => setViewBox(e.target.value)}
                  placeholder="0 0 200 200"
                  className="font-mono text-sm bg-background/50"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={filled}
                  onChange={(e) => setFilled(e.target.checked)}
                  className="accent-primary"
                />
                {t("fillToggle")}
              </label>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <Label>{t("stroke")}</Label>
                  <span className="text-primary font-mono">{strokeWidth}px</span>
                </div>
                <Slider value={[strokeWidth]} onValueChange={(v) => setStrokeWidth(v[0])} min={0.5} max={20} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <Label>Zoom</Label>
                  <span className="text-primary font-mono">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Slider className="flex-1" value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={0.1} max={5} step={0.1} />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(5, zoom + 0.2))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="relative group min-h-[300px] lg:min-h-full bg-muted/20 rounded-2xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-md rounded-lg border border-border/50 shadow-sm z-10">
              <Move className="w-4 h-4 text-muted-foreground" />
            </div>

            <svg
              width="100%"
              height="100%"
              viewBox={viewBox}
              className="w-full h-full transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
            >
              <title>{t("title")}</title>
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/10" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              <path
                d={d}
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-primary drop-shadow-md"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Command / segment breakdown */}
        <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
          <Label className="text-sm font-semibold">{t("commandBreakdown")}</Label>
          {errors.length > 0 && (
            <ul className="text-xs text-destructive space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
          {segments.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("noCommands")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary/10 px-1">
                      {seg.command}
                    </span>
                    <span className="text-muted-foreground font-sans text-[11px]">
                      {describeSegment(seg)}
                    </span>
                  </div>
                  {seg.args.length > 0 && (
                    <div className="mt-1 text-muted-foreground break-all">{seg.args.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
