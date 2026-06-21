"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildClamp, clampedSizeAt } from "./css-clamp-generator.utils"

const COPY_RESET_MS = 2000
const DEFAULT_ROOT = 16

// Properties that accept a clamp() value. Some render the computed value as a
// box dimension in the preview rather than as text size.
const PROPERTIES = ["font-size", "padding", "margin", "gap", "width"] as const
type Property = (typeof PROPERTIES)[number]

const round = (value: number) => Math.round(value * 100) / 100

export function CssClampGenerator() {
  const t = useTranslations("CssClampGenerator")
  const [property, setProperty] = useState<Property>("font-size")
  const [minViewport, setMinViewport] = useState(320)
  const [maxViewport, setMaxViewport] = useState(1280)
  const [minSize, setMinSize] = useState(16)
  const [maxSize, setMaxSize] = useState(32)
  const [previewWidth, setPreviewWidth] = useState(768)
  const [copied, setCopied] = useState(false)

  const geometry = useMemo(
    () => ({ minViewport, maxViewport, minSize, maxSize }),
    [minViewport, maxViewport, minSize, maxSize],
  )

  const clamp = useMemo(
    () => buildClamp({ ...geometry, rootFontSize: DEFAULT_ROOT }),
    [geometry],
  )

  const cssLine = clamp ? `${property}: ${clamp};` : ""

  // Rendered value at the three reference viewport widths.
  const previews = useMemo(() => {
    if (!clamp) return null
    return {
      min: round(clampedSizeAt(geometry, minViewport)),
      current: round(clampedSizeAt(geometry, previewWidth)),
      max: round(clampedSizeAt(geometry, maxViewport)),
    }
  }, [clamp, geometry, minViewport, maxViewport, previewWidth])

  const handleCopy = async () => {
    if (!cssLine) return
    try {
      await navigator.clipboard.writeText(cssLine)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (error) {
      console.error("Failed to copy clamp CSS:", error)
    }
  }

  const fields: Array<[string, number, (value: number) => void]> = [
    [t("minViewport"), minViewport, setMinViewport],
    [t("maxViewport"), maxViewport, setMaxViewport],
    [t("minSize"), minSize, setMinSize],
    [t("maxSize"), maxSize, setMaxSize],
  ]

  // Renders the computed value either as font-size on text, or as a box
  // dimension (padding/margin/gap/width) so the effect is visible.
  const renderPreviewBox = (px: number) => {
    if (property === "font-size") {
      return (
        <span style={{ fontSize: `${px}px` }} className="font-semibold leading-tight">
          Aa
        </span>
      )
    }
    if (property === "width") {
      return (
        <div
          style={{ width: `${px}px` }}
          className="h-4 max-w-full rounded bg-primary"
        />
      )
    }
    // padding / margin / gap — visualise as spacing around a marker block.
    return (
      <div style={{ padding: `${px}px` }} className="inline-block rounded bg-primary/15">
        <div className="h-4 w-4 rounded bg-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <GlassCard className="space-y-4 p-6">
        <div className="space-y-2">
          <Label>{t("property")}</Label>
          <Select
            value={property}
            onValueChange={(value) => setProperty(value as Property)}
          >
            <SelectTrigger className="w-full font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTIES.map((p) => (
                <SelectItem key={p} value={p} className="font-mono">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map(([label, value, setter]) => (
            <div key={label} className="space-y-2">
              <Label>{label} (px)</Label>
              <Input
                type="number"
                value={value}
                onChange={(event) => setter(Number(event.target.value))}
                className="font-mono"
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Label>{t("result")}</Label>
          <Button size="sm" onClick={handleCopy} disabled={!cssLine}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? t("copied") : t("copy")}
          </Button>
        </div>
        <code className="block overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm">
          {cssLine || t("invalid")}
        </code>
      </GlassCard>

      {previews && (
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Label>{t("preview")}</Label>
            <span className="font-mono text-xs text-muted-foreground">
              {previewWidth}px
            </span>
          </div>

          <Slider
            value={[previewWidth]}
            min={minViewport}
            max={maxViewport}
            step={1}
            onValueChange={([value]) => setPreviewWidth(value)}
            aria-label={t("previewWidth")}
          />

          {/* Resizable live preview: the box width tracks the slider so the
              rendered value visibly changes with the simulated viewport. */}
          <div className="rounded-lg border border-border/50 bg-background/40 p-4">
            <div
              style={{ width: `${previewWidth}px`, maxWidth: "100%" }}
              className="mx-auto flex min-h-[64px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30 p-4"
            >
              {renderPreviewBox(previews.current)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                [t("atMin"), `${minViewport}px`, previews.min],
                [t("atCurrent"), `${previewWidth}px`, previews.current],
                [t("atMax"), `${maxViewport}px`, previews.max],
              ] as Array<[string, string, number]>
            ).map(([label, vw, px]) => (
              <div
                key={label}
                className="rounded-lg bg-muted/40 p-3 font-mono text-xs"
              >
                <div className="text-muted-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground/70">{vw}</div>
                <div className="mt-1 text-sm font-semibold">{px}px</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
