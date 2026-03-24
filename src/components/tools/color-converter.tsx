"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, CheckCircle2, Palette, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Pure TS Conversion Functions ────────────────────────────────────────────

function clamp(value: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").trim()
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  )
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn:
        h = (((gn - bn) / delta) % 6)
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      case bn:
        h = (rn - gn) / delta + 4
        break
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let rn = 0,
    gn = 0,
    bn = 0

  if (h < 60) {
    rn = c; gn = x; bn = 0
  } else if (h < 120) {
    rn = x; gn = c; bn = 0
  } else if (h < 180) {
    rn = 0; gn = c; bn = x
  } else if (h < 240) {
    rn = 0; gn = x; bn = c
  } else if (h < 300) {
    rn = x; gn = 0; bn = c
  } else {
    rn = c; gn = 0; bn = x
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  }
}

function rgbToHsb(
  r: number,
  g: number,
  b: number
): { h: number; s: number; b: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  const s = max === 0 ? 0 : delta / max
  const v = max

  if (delta !== 0) {
    switch (max) {
      case rn:
        h = (((gn - bn) / delta) % 6)
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      case bn:
        h = (rn - gn) / delta + 4
        break
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  }
}

function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 }
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  const c = (1 - rn - k) / (1 - k)
  const m = (1 - gn - k) / (1 - k)
  const y = (1 - bn - k) / (1 - k)
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvertedResult {
  format: string
  label: string
  value: string
  display: string
}

interface ColorState {
  hex: string
  rgb: { r: number; g: number; b: number }
  isValid: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeResults(rgb: { r: number; g: number; b: number }): ConvertedResult[] {
  const { r, g, b } = rgb
  const hex = rgbToHex(r, g, b)
  const hsl = rgbToHsl(r, g, b)
  const hsb = rgbToHsb(r, g, b)
  const cmyk = rgbToCmyk(r, g, b)

  return [
    {
      format: "HEX",
      label: "Hexadecimal",
      value: hex,
      display: hex,
    },
    {
      format: "RGB",
      label: "Red, Green, Blue",
      value: `rgb(${r}, ${g}, ${b})`,
      display: `rgb(${r}, ${g}, ${b})`,
    },
    {
      format: "HSL",
      label: "Hue, Saturation, Lightness",
      value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      display: `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`,
    },
    {
      format: "HSB",
      label: "Hue, Saturation, Brightness",
      value: `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`,
      display: `hsb(${hsb.h}°, ${hsb.s}%, ${hsb.b}%)`,
    },
    {
      format: "CMYK",
      label: "Cyan, Magenta, Yellow, Key",
      value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      display: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
  ]
}

function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const n = c / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function getTextColor(r: number, g: number, b: number): string {
  return getLuminance(r, g, b) > 0.179 ? "#1a1a1a" : "#ffffff"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultCard({
  result,
  bgColor,
  textColor,
}: {
  result: ConvertedResult
  bgColor: string
  textColor: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
      {/* Color preview strip */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: bgColor }}
      />
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {result.format}
            </span>
            <p className="text-[9px] text-muted-foreground/60 font-medium">
              {result.label}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 rounded-xl transition-all duration-200",
              copied
                ? "text-green-500 bg-green-500/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="font-mono text-sm font-bold tracking-tight text-foreground break-all">
          {result.display}
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_HEX = "#3B82F6"
const DEFAULT_RGB = hexToRgb(DEFAULT_HEX)!

export function ColorConverter() {
  const [hexInput, setHexInput] = useState(DEFAULT_HEX)
  const [colorState, setColorState] = useState<ColorState>({
    hex: DEFAULT_HEX,
    rgb: DEFAULT_RGB,
    isValid: true,
  })

  const applyRgb = useCallback((rgb: { r: number; g: number; b: number }) => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexInput(hex)
    setColorState({ hex, rgb, isValid: true })
  }, [])

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    const rgb = hexToRgb(hex)
    if (!rgb) return
    setHexInput(hex.toUpperCase())
    setColorState({ hex, rgb, isValid: true })
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setHexInput(raw)
    const rgb = hexToRgb(raw)
    if (rgb) {
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      setColorState({ hex, rgb, isValid: true })
    } else {
      setColorState((prev) => ({ ...prev, isValid: false }))
    }
  }

  const results = computeResults(colorState.rgb)
  const { r, g, b } = colorState.rgb
  const textColor = getTextColor(r, g, b)
  const previewBg = colorState.isValid ? colorState.hex : "#cccccc"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Input Section */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Color Picker + Preview */}
        <Card className="lg:col-span-2 border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/30 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-500" />
              Color Picker
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Large preview swatch */}
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-lg transition-colors duration-200"
              style={{ backgroundColor: previewBg, height: "140px" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span
                  className="text-2xl font-black tracking-tighter font-mono"
                  style={{ color: textColor }}
                >
                  {colorState.isValid ? colorState.hex.toUpperCase() : "—"}
                </span>
                <span
                  className="text-xs font-bold opacity-70"
                  style={{ color: textColor }}
                >
                  {colorState.isValid
                    ? `rgb(${r}, ${g}, ${b})`
                    : "Invalid color"}
                </span>
              </div>
            </div>

            {/* Native color picker */}
            <div className="relative">
              <input
                type="color"
                value={colorState.isValid ? colorState.hex : "#000000"}
                onChange={handlePickerChange}
                className="w-full h-12 rounded-xl cursor-pointer border border-border/30 bg-transparent p-1"
                title="Pick a color"
              />
            </div>

            {/* HEX text input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                HEX Value
              </label>
              <div className="relative">
                <Input
                  value={hexInput}
                  onChange={handleHexInput}
                  placeholder="#3B82F6"
                  className={cn(
                    "font-mono text-center font-bold pr-8 transition-colors",
                    !colorState.isValid &&
                      hexInput.length > 1 &&
                      "border-red-400 focus-visible:ring-red-400"
                  )}
                  maxLength={9}
                />
                {!colorState.isValid && hexInput.length > 1 && (
                  <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                )}
              </div>
              {!colorState.isValid && hexInput.length > 1 && (
                <p className="text-[10px] text-red-400 font-medium">
                  Invalid HEX format. Use #RGB or #RRGGBB
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RGB Sliders */}
        <Card className="lg:col-span-3 border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/30 pb-4">
            <CardTitle className="text-base font-bold">
              RGB Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {(
              [
                { key: "r", label: "Red", color: "#ef4444", max: 255 },
                { key: "g", label: "Green", color: "#22c55e", max: 255 },
                { key: "b", label: "Blue", color: "#3b82f6", max: 255 },
              ] as const
            ).map(({ key, label, color }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={255}
                      value={colorState.rgb[key]}
                      onChange={(e) => {
                        const val = clamp(Number(e.target.value))
                        applyRgb({ ...colorState.rgb, [key]: val })
                      }}
                      className="h-7 w-16 text-center text-xs font-mono font-bold p-1"
                    />
                  </div>
                </div>
                <div className="relative h-4 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={colorState.rgb[key]}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      applyRgb({ ...colorState.rgb, [key]: val })
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: (() => {
                        const base = { ...colorState.rgb }
                        const startRgb = { ...base, [key]: 0 }
                        const endRgb = { ...base, [key]: 255 }
                        return `linear-gradient(to right, rgb(${startRgb.r},${startRgb.g},${startRgb.b}), rgb(${endRgb.r},${endRgb.g},${endRgb.b}))`
                      })(),
                      accentColor: color,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Quick presets */}
            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Quick Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "#EF4444",
                  "#F97316",
                  "#EAB308",
                  "#22C55E",
                  "#3B82F6",
                  "#8B5CF6",
                  "#EC4899",
                  "#06B6D4",
                  "#FFFFFF",
                  "#000000",
                ].map((preset) => {
                  const rgb = hexToRgb(preset)!
                  return (
                    <button
                      key={preset}
                      onClick={() => applyRgb(rgb)}
                      title={preset}
                      className={cn(
                        "h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95 shadow-sm",
                        colorState.hex.toLowerCase() === preset.toLowerCase()
                          ? "border-primary ring-2 ring-primary/40 scale-110"
                          : "border-border/30"
                      )}
                      style={{ backgroundColor: preset }}
                    />
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">
          Conversion Results
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {results.map((result) => (
            <ResultCard
              key={result.format}
              result={result}
              bgColor={previewBg}
              textColor={textColor}
            />
          ))}
        </div>
      </div>

      {/* Info footer */}
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-secondary/20 border border-border/10">
        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 shrink-0">
          <Palette className="h-4 w-4" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Client-side only:</strong> All color math runs entirely in your
          browser using pure TypeScript — no external libraries or server calls.
        </p>
      </div>
    </div>
  )
}
