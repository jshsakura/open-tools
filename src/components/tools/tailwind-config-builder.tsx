"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

export function TailwindConfigBuilder() {
  const t = useTranslations("TailwindConfigBuilder.ui")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [spacing, setSpacing] = useState("4px")
  const [darkMode, setDarkMode] = useState("class")

  const configCode = `module.exports = {
  darkMode: '${darkMode}',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${primaryColor}',
          foreground: '#ffffff',
        },
      },
      spacing: {
        base: '${spacing}',
      },
    },
  },
  plugins: [],
}`

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
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5" />
              {t("exportBtn")}
            </Button>
          </div>
          <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto">
            {configCode}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}