"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"

export function MeshGradientGenerator() {
  const t = useTranslations("MeshGradientGenerator.ui")
  const [c1, setC1] = useState("#ff007f")
  const [c2, setC2] = useState("#7f00ff")
  const [c3, setC3] = useState("#00f5d4")
  const [c4, setC4] = useState("#fee440")
  const [animate, setAnimate] = useState(false)

  const colors: Array<{ label: string; value: string; set: (v: string) => void }> = [
    { label: "Color 1", value: c1, set: setC1 },
    { label: "Color 2", value: c2, set: setC2 },
    { label: "Color 3", value: c3, set: setC3 },
    { label: "Color 4", value: c4, set: setC4 },
  ]

  const gradientImage = `radial-gradient(at 0% 0%, ${c1} 0px, transparent 50%),
    radial-gradient(at 100% 0%, ${c2} 0px, transparent 50%),
    radial-gradient(at 100% 100%, ${c3} 0px, transparent 50%),
    radial-gradient(at 0% 100%, ${c4} 0px, transparent 50%)`

  const previewStyle: React.CSSProperties = {
    backgroundColor: c1,
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
  background-color: ${c1};
  background-image:
    radial-gradient(at 0% 0%, ${c1} 0px, transparent 50%),
    radial-gradient(at 100% 0%, ${c2} 0px, transparent 50%),
    radial-gradient(at 100% 100%, ${c3} 0px, transparent 50%),
    radial-gradient(at 0% 100%, ${c4} 0px, transparent 50%);${animationCss}}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssCode)
    toast.success(t("copyCss"))
  }

  return (
    <Card className="max-w-4xl mx-auto border-border/50 bg-card/30 backdrop-blur-md">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {colors.map((col) => (
              <div key={col.label}>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{col.label}</label>
                <input
                  type="color"
                  value={col.value}
                  onChange={(e) => col.set(e.target.value)}
                  className="w-full h-10 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>
            ))}
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
