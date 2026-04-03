"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { 
  Pipette, 
  Copy, 
  Check, 
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"

// Simplified color database for implementation
const COLOR_NAMES: Record<string, string> = {
  "#FF0000": "Red", "#00FF00": "Lime", "#0000FF": "Blue", "#FFFF00": "Yellow", "#00FFFF": "Cyan", "#FF00FF": "Magenta",
  "#C0C0C0": "Silver", "#808080": "Gray", "#800000": "Maroon", "#808000": "Olive", "#008000": "Green", "#800080": "Purple",
  "#008080": "Teal", "#000080": "Navy", "#FFFFFF": "White", "#000000": "Black", "#FFA500": "Orange", "#A52A2A": "Brown",
  "#FFC0CB": "Pink", "#FFD700": "Gold", "#4B0082": "Indigo", "#EE82EE": "Violet",
  "#F0F8FF": "Alice Blue", "#FAEBD7": "Antique White", "#7FFFD4": "Aquamarine", "#F0FFFF": "Azure", "#F5F5DC": "Beige",
  "#FFE4C4": "Bisque", "#FFEBCD": "Blanched Almond", "#8A2BE2": "Blue Violet", "#5F9EA0": "Cadet Blue", "#7FFF00": "Chartreuse",
  "#D2691E": "Chocolate", "#FF7F50": "Coral", "#6495ED": "Cornflower Blue", "#FFF8DC": "Cornsilk", "#DC143C": "Crimson",
  "#00008B": "Dark Blue", "#008B8B": "Dark Cyan", "#B8860B": "Dark Goldenrod", "#A9A9A9": "Dark Gray", "#006400": "Dark Green",
  "#BDB76B": "Dark Khaki", "#8B008B": "Dark Magenta", "#556B2F": "Dark Olive Green", "#FF8C00": "Dark Orange", "#9932CC": "Dark Orchid",
  "#8B0000": "Dark Red", "#E9967A": "Dark Salmon", "#8FBC8F": "Dark Sea Green", "#483D8B": "Dark Slate Blue", "#2F4F4F": "Dark Slate Gray",
  "#00CED1": "Dark Turquoise", "#9400D3": "Dark Violet", "#FF1493": "Deep Pink", "#00BFFF": "Deep Sky Blue", "#696969": "Dim Gray",
  "#1E90FF": "Dodger Blue", "#B22222": "Fire Brick", "#FFFAF0": "Floral White", "#228B22": "Forest Green", "#DCDCDC": "Gainsboro",
  "#F8F8FF": "Ghost White", "#DAA520": "Goldenrod", "#ADFF2F": "Green Yellow", "#F0FFF0": "Honey Dew", "#CD5C5C": "Indian Red",
  "#FFFFF0": "Ivory", "#F0E68C": "Khaki", "#E6E6FA": "Lavender", "#FFF0F5": "Lavender Blush", "#7CFC00": "Lawn Green",
  "#FFFACD": "Lemon Chiffon", "#ADD8E6": "Light Blue", "#F08080": "Light Coral", "#E0FFFF": "Light Cyan", "#FAFAD2": "Light Goldenrod Yellow",
  "#D3D3D3": "Light Gray", "#90EE90": "Light Green", "#FFB6C1": "Light Pink", "#FFA07A": "Light Salmon", "#20B2AA": "Light Sea Green",
  "#87CEFA": "Light Sky Blue", "#778899": "Light Slate Gray", "#B0C4DE": "Light Steel Blue", "#FFFFE0": "Light Yellow",
  "#32CD32": "Lime Green", "#FAF0E6": "Linen", "#66CDAA": "Medium Aquamarine", "#0000CD": "Medium Blue", "#BA55D3": "Medium Orchid",
  "#9370DB": "Medium Purple", "#3CB371": "Medium Sea Green", "#7B68EE": "Medium Slate Blue", "#00FA9A": "Medium Spring Green",
  "#48D1CC": "Medium Turquoise", "#C71585": "Medium Violet Red", "#191970": "Midnight Blue", "#F5FFFA": "Mint Cream",
  "#FFE4E1": "Misty Rose", "#FFE4B5": "Moccasin", "#FFDEAD": "Navajo White", "#FDF5E6": "Old Lace", "#6B8E23": "Olive Drab",
  "#FF4500": "Orange Red", "#DA70D6": "Orchid", "#EEE8AA": "Pale Goldenrod", "#98FB98": "Pale Green", "#AFEEEE": "Pale Turquoise",
  "#DB7093": "Pale Violet Red", "#FFEFD5": "Papaya Whip", "#FFDAB9": "Peach Puff", "#CD853F": "Peru", "#DDA0DD": "Plum",
  "#B0E0E6": "Powder Blue", "#BC8F8F": "Rosy Brown", "#4169E1": "Royal Blue", "#8B4513": "Saddle Brown", "#FA8072": "Salmon",
  "#F4A460": "Sandy Brown", "#2E8B57": "Sea Green", "#FFF5EE": "Sea Shell", "#A0522D": "Sienna", "#87CEEB": "Sky Blue",
  "#6A5ACD": "Slate Blue", "#708090": "Slate Gray", "#FFFAFA": "Snow", "#00FF7F": "Spring Green", "#4682B4": "Steel Blue",
  "#D2B48C": "Tan", "#D8BFD8": "Thistle", "#FF6347": "Tomato", "#40E0D0": "Turquoise", "#F5DEB3": "Wheat", "#F5F5F5": "White Smoke",
}

export function ColorNameFinder() {
  const t = useTranslations("ColorNameFinder")
  const [color, setColor] = useState("#3b82f6")
  const [copied, setCopied] = useState(false)

  const closestName = useMemo(() => {
    const normalizedColor = color.toUpperCase()

    if (COLOR_NAMES[normalizedColor]) {
      return COLOR_NAMES[normalizedColor]
    }

    const r1 = parseInt(normalizedColor.slice(1, 3), 16)
    const g1 = parseInt(normalizedColor.slice(3, 5), 16)
    const b1 = parseInt(normalizedColor.slice(5, 7), 16)

    let minDiff = Infinity
    let closest = "Unknown"

    for (const [hex, name] of Object.entries(COLOR_NAMES)) {
      const r2 = parseInt(hex.slice(1, 3), 16)
      const g2 = parseInt(hex.slice(3, 5), 16)
      const b2 = parseInt(hex.slice(5, 7), 16)

      const diff = Math.sqrt(
        Math.pow(r1 - r2, 2) +
          Math.pow(g1 - g2, 2) +
          Math.pow(b1 - b2, 2),
      )

      if (diff < minDiff) {
        minDiff = diff
        closest = name
      }
    }

    return closest
  }, [color])

  const handleCopy = async (val: string) => {
    await navigator.clipboard.writeText(val)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Picker */}
          <div className="space-y-4 text-center">
            <div 
              className="w-48 h-48 rounded-full shadow-2xl border-8 border-white/20 transition-all duration-500 transform hover:scale-105"
              style={{ backgroundColor: color }}
            />
            <div className="relative inline-block">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <Button variant="secondary" className="gap-2">
                <Pipette className="w-4 h-4" />
                {t("inputColor")}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t("closestName")}</Label>
              <h2 className="text-4xl font-black tracking-tighter">{closestName}</h2>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between">
                <code className="text-xl font-mono font-bold">{color.toUpperCase()}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(color)} className="h-8">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">RGB</span>
                  <span className="font-mono text-sm">
                    {parseInt(color.slice(1,3), 16)}, {parseInt(color.slice(3,5), 16)}, {parseInt(color.slice(5,7), 16)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">{t("status")}</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Zap className="w-3.5 h-3.5" />
                    {t("identified")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
