"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

type FontCategory = "serif" | "sans" | "display" | "mono"

type FontPair = {
  name: string
  category: FontCategory
  hFont: string
  bFont: string
  code: string
}

const FONTS: Record<string, FontPair> = {
  "playfair-lora": {
    name: "Playfair Display + Lora",
    category: "serif",
    hFont: "'Playfair Display', serif",
    bFont: "'Lora', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Lora&family=Playfair+Display:wght@700&display=swap');",
  },
  "inter-roboto": {
    name: "Inter + Roboto",
    category: "sans",
    hFont: "'Inter', sans-serif",
    bFont: "'Roboto', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Roboto&display=swap');",
  },
  "montserrat-merriweather": {
    name: "Montserrat + Merriweather",
    category: "sans",
    hFont: "'Montserrat', sans-serif",
    bFont: "'Merriweather', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Merriweather&family=Montserrat:wght@700&display=swap');",
  },
  "poppins-pt-serif": {
    name: "Poppins + PT Serif",
    category: "sans",
    hFont: "'Poppins', sans-serif",
    bFont: "'PT Serif', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=PT+Serif&family=Poppins:wght@700&display=swap');",
  },
  "oswald-quattrocento": {
    name: "Oswald + Quattrocento",
    category: "sans",
    hFont: "'Oswald', sans-serif",
    bFont: "'Quattrocento', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600&family=Quattrocento&display=swap');",
  },
  "dm-serif-dm-sans": {
    name: "DM Serif Display + DM Sans",
    category: "serif",
    hFont: "'DM Serif Display', serif",
    bFont: "'DM Sans', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=DM+Sans&family=DM+Serif+Display&display=swap');",
  },
  "libre-baskerville-source-sans": {
    name: "Libre Baskerville + Source Sans 3",
    category: "serif",
    hFont: "'Libre Baskerville', serif",
    bFont: "'Source Sans 3', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Source+Sans+3&display=swap');",
  },
  "space-grotesk-ibm-plex": {
    name: "Space Grotesk + IBM Plex Sans",
    category: "sans",
    hFont: "'Space Grotesk', sans-serif",
    bFont: "'IBM Plex Sans', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans&family=Space+Grotesk:wght@600&display=swap');",
  },
  "abril-fatface-poppins": {
    name: "Abril Fatface + Poppins",
    category: "display",
    hFont: "'Abril Fatface', display",
    bFont: "'Poppins', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Poppins&display=swap');",
  },
  "bebas-neue-roboto": {
    name: "Bebas Neue + Roboto",
    category: "display",
    hFont: "'Bebas Neue', display",
    bFont: "'Roboto', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto&display=swap');",
  },
  "righteous-lato": {
    name: "Righteous + Lato",
    category: "display",
    hFont: "'Righteous', display",
    bFont: "'Lato', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Lato&family=Righteous&display=swap');",
  },
  "jetbrains-inter": {
    name: "JetBrains Mono + Inter",
    category: "mono",
    hFont: "'JetBrains Mono', monospace",
    bFont: "'Inter', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Inter&family=JetBrains+Mono:wght@700&display=swap');",
  },
  "space-mono-work-sans": {
    name: "Space Mono + Work Sans",
    category: "mono",
    hFont: "'Space Mono', monospace",
    bFont: "'Work Sans', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&family=Work+Sans&display=swap');",
  },
}

const CATEGORIES: Array<FontCategory | "all"> = [
  "all",
  "serif",
  "sans",
  "display",
  "mono",
]

const WEIGHT_MIN = 100
const WEIGHT_MAX = 900
const WEIGHT_STEP = 100
const SIZE_MIN = 14
const SIZE_MAX = 64
const LINE_HEIGHT_MIN = 1
const LINE_HEIGHT_MAX = 2.4

// Builds the full copy-paste CSS: @import plus heading and body declarations.
function buildCssExport(
  pair: FontPair,
  weight: number,
  size: number,
  lineHeight: number,
): string {
  const bodySize = Math.max(SIZE_MIN, Math.round(size / 2))
  return [
    pair.code,
    "",
    "h1, h2, h3 {",
    `  font-family: ${pair.hFont};`,
    `  font-weight: ${weight};`,
    `  font-size: ${size}px;`,
    `  line-height: ${lineHeight};`,
    "}",
    "",
    "body {",
    `  font-family: ${pair.bFont};`,
    `  font-size: ${bodySize}px;`,
    `  line-height: ${lineHeight};`,
    "}",
  ].join("\n")
}

export function FontPairer() {
  const t = useTranslations("FontPairer.ui")
  const [preset, setPreset] = useState("playfair-lora")
  const [category, setCategory] = useState<FontCategory | "all">("all")
  const [weight, setWeight] = useState(700)
  const [size, setSize] = useState(32)
  const [lineHeight, setLineHeight] = useState(1.3)
  const [title, setTitle] = useState(t("sampleTitle"))
  const [body, setBody] = useState(t("sampleBody"))

  const visibleKeys = useMemo(
    () =>
      Object.keys(FONTS).filter(
        (k) => category === "all" || FONTS[k].category === category,
      ),
    [category],
  )

  const current = FONTS[preset]
  const bodySize = Math.max(SIZE_MIN, Math.round(size / 2))

  const cssExport = useMemo(
    () => buildCssExport(current, weight, size, lineHeight),
    [current, weight, size, lineHeight],
  )

  const handleCategory = (next: FontCategory | "all") => {
    setCategory(next)
    // Keep selection valid: if the active preset leaves the filter, pick the
    // first one that matches the new category.
    if (next !== "all" && current.category !== next) {
      const firstMatch = Object.keys(FONTS).find(
        (k) => FONTS[k].category === next,
      )
      if (firstMatch) setPreset(firstMatch)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cssExport)
    toast.success(t("copied"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      {/* Load every preset font so the live preview renders correctly. */}
      <style>
        {Object.values(FONTS)
          .map((f) => f.code)
          .join("\n")}
      </style>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("categoryFilter")}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  variant={category === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategory(c)}
                  className="text-xs"
                >
                  {t(`category_${c}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("presetSelect")}
            </Label>
            <div className="flex flex-col gap-2">
              {visibleKeys.map((k) => (
                <Button
                  key={k}
                  variant={preset === k ? "default" : "outline"}
                  onClick={() => setPreset(k)}
                  className="justify-start font-semibold text-xs py-1"
                >
                  {FONTS[k].name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{t("weight")}</span>
                <span className="font-mono">{weight}</span>
              </div>
              <Slider
                value={[weight]}
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={WEIGHT_STEP}
                onValueChange={([v]) => setWeight(v)}
                aria-label={t("weight")}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{t("size")}</span>
                <span className="font-mono">{size}px</span>
              </div>
              <Slider
                value={[size]}
                min={SIZE_MIN}
                max={SIZE_MAX}
                step={1}
                onValueChange={([v]) => setSize(v)}
                aria-label={t("size")}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{t("lineHeight")}</span>
                <span className="font-mono">{lineHeight.toFixed(2)}</span>
              </div>
              <Slider
                value={[lineHeight]}
                min={LINE_HEIGHT_MIN}
                max={LINE_HEIGHT_MAX}
                step={0.05}
                onValueChange={([v]) => setLineHeight(v)}
                aria-label={t("lineHeight")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("cssOutput")}
              </span>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                <Clipboard className="w-3.5 h-3.5" />
                {t("copyCss")}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-56 overflow-auto">
              {cssExport}
            </pre>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-background/40 p-6 space-y-3">
            <h2
              style={{
                fontFamily: current.hFont,
                fontWeight: weight,
                fontSize: `${size}px`,
                lineHeight,
              }}
              className="break-words"
            >
              {title || t("sampleTitle")}
            </h2>
            <p
              style={{
                fontFamily: current.bFont,
                fontSize: `${bodySize}px`,
                lineHeight,
              }}
              className="text-muted-foreground break-words"
            >
              {body || t("sampleBody")}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground block">
              {t("previewTitleLabel")}
            </Label>
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <Label className="text-xs font-semibold text-muted-foreground block">
              {t("previewBodyLabel")}
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
