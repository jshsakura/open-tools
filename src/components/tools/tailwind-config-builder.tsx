"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateColorScale, SHADES } from "./tailwind-config-builder.utils"

const FONT_FAMILIES: ReadonlyArray<{ value: string; label: string; stack: string }> = [
  { value: "Inter", label: "Inter", stack: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { value: "Roboto", label: "Roboto", stack: "Roboto, ui-sans-serif, system-ui, sans-serif" },
  { value: "Poppins", label: "Poppins", stack: "Poppins, ui-sans-serif, system-ui, sans-serif" },
  { value: "system", label: "System", stack: "ui-sans-serif, system-ui, sans-serif" },
]

function indent(record: Record<string, string>, pad: string): string {
  return Object.entries(record)
    .map(([key, value]) => `${pad}'${key}': '${value}',`)
    .join("\n")
}

export function TailwindConfigBuilder() {
  const t = useTranslations("TailwindConfigBuilder.ui")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [spacing, setSpacing] = useState("4px")
  const [darkMode, setDarkMode] = useState("class")
  const [fontFamily, setFontFamily] = useState("Inter")

  const colorScale = useMemo(() => generateColorScale(primaryColor), [primaryColor])

  const fontStack = useMemo(
    () => FONT_FAMILIES.find((f) => f.value === fontFamily)?.stack ?? FONT_FAMILIES[0].stack,
    [fontFamily],
  )

  const configCode = useMemo(() => {
    const colorLines = SHADES.map((shade) => `          ${shade}: '${colorScale[shade]}',`).join("\n")
    const screens = indent(
      { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
      "        ",
    )
    const radius = indent(
      { none: "0px", sm: "0.25rem", DEFAULT: "0.5rem", lg: "1rem", full: "9999px" },
      "        ",
    )
    return `module.exports = {
  darkMode: '${darkMode}',
  theme: {
    extend: {
      colors: {
        primary: {
${colorLines}
          DEFAULT: '${colorScale[500]}',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['${fontStack.split(", ").join("', '")}'],
      },
      screens: {
${screens}
      },
      borderRadius: {
${radius}
      },
      spacing: {
        base: '${spacing}',
      },
    },
  },
  plugins: [],
}`
  }, [colorScale, darkMode, fontStack, spacing])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(configCode)
    toast.success(t("exportBtn"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("themeColor")}</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent"
              />
              <span className="text-sm font-mono">{primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("colorScale")}</label>
            <div className="grid grid-cols-10 gap-1 rounded-md border border-border/50 p-2">
              {SHADES.map((shade) => (
                <div key={shade} className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: colorScale[shade] }}
                    title={`${shade}: ${colorScale[shade]}`}
                  />
                  <span className="text-[9px] text-muted-foreground">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("fontFamily")}</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("spacing")}</label>
            <select
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            >
              <option value="4px">4px (Compact)</option>
              <option value="8px">8px (Standard)</option>
              <option value="12px">12px (Relaxed)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("darkMode")}</label>
            <select
              value={darkMode}
              onChange={(e) => setDarkMode(e.target.value)}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            >
              <option value="class">class</option>
              <option value="media">media</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">tailwind.config.js</span>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              <Clipboard className="w-3.5 h-3.5" />
              {t("exportBtn")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[460px] overflow-y-auto">
            {configCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
