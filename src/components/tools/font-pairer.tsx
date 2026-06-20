"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

type FontPair = {
  name: string
  hFont: string
  bFont: string
  code: string
}

const FONTS: Record<string, FontPair> = {
  "playfair-lora": {
    name: "Playfair Display + Lora",
    hFont: "'Playfair Display', serif",
    bFont: "'Lora', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Lora&family=Playfair+Display:wght@700&display=swap');",
  },
  "inter-roboto": {
    name: "Inter + Roboto",
    hFont: "'Inter', sans-serif",
    bFont: "'Roboto', sans-serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Roboto&display=swap');",
  },
  "montserrat-merriweather": {
    name: "Montserrat + Merriweather",
    hFont: "'Montserrat', sans-serif",
    bFont: "'Merriweather', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Merriweather&family=Montserrat:wght@700&display=swap');",
  },
  "poppins-pt-serif": {
    name: "Poppins + PT Serif",
    hFont: "'Poppins', sans-serif",
    bFont: "'PT Serif', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=PT+Serif&family=Poppins:wght@700&display=swap');",
  },
  "oswald-quattrocento": {
    name: "Oswald + Quattrocento",
    hFont: "'Oswald', sans-serif",
    bFont: "'Quattrocento', serif",
    code: "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600&family=Quattrocento&display=swap');",
  },
}

export function FontPairer() {
  const t = useTranslations("FontPairer.ui")
  const [preset, setPreset] = useState("playfair-lora")

  const current = FONTS[preset]

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code)
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
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              {t("presetSelect")}
            </label>
            <div className="flex flex-col gap-2">
              {Object.keys(FONTS).map((k) => (
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">CSS @import</span>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                <Clipboard className="w-3.5 h-3.5" />
                {t("copyImport")}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-muted text-xs font-mono whitespace-pre-wrap select-all">
              {current.code}
            </pre>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-background/40 p-6 space-y-3">
          <h2
            style={{ fontFamily: current.hFont }}
            className="text-2xl font-bold leading-snug"
          >
            {t("sampleTitle")}
          </h2>
          <p
            style={{ fontFamily: current.bFont }}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {t("sampleBody")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
