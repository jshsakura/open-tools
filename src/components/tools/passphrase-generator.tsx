"use client"

import { useState, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { 
  KeyRound, 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck,
  Settings2,
  List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

const WORD_LIST = [
  "apple", "beach", "brain", "bread", "brush", "chair", "chest", "chord", "click", "clock",
  "cloud", "dance", "diary", "drink", "earth", "feast", "field", "flame", "flash", "float",
  "floor", "focus", "fruit", "glass", "green", "guide", "heart", "house", "juice", "light",
  "lemon", "magic", "music", "night", "ocean", "paint", "paper", "phone", "piano", "pilot",
  "plant", "plate", "radio", "river", "robot", "rocky", "round", "scene", "score", "sharp",
  "shirt", "sight", "silver", "smile", "snake", "space", "spoon", "stage", "star", "stone",
  "table", "tiger", "toast", "touch", "train", "truck", "voice", "water", "watch", "whale",
  "world", "write", "youth", "zebra", "active", "bright", "clever", "direct", "energy", "famous",
  "gentle", "happy", "island", "jungle", "kindly", "lovely", "modern", "native", "orange", "perfect",
  "quiet", "rising", "strong", "travel", "unique", "vivid", "winter", "yellow", "zenith", "bridge"
]

export function PassphraseGenerator() {
  const t = useTranslations("PassphraseGenerator")
  const [passphrase, setPassphrase] = useState("")
  const [wordCount, setWordCount] = useState(4)
  const [separator, setSeparator] = useState("-")
  const [capitalize, setCapitalize] = useState(true)
  const [includeNumber, setIncludeNumber] = useState(true)
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    let selected = []
    const crypto = window.crypto
    const array = new Uint32Array(wordCount)
    crypto.getRandomValues(array)

    for (let i = 0; i < wordCount; i++) {
      let word = WORD_LIST[array[i] % WORD_LIST.length]
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }
      selected.push(word)
    }

    let result = selected.join(separator)
    if (includeNumber) {
      const num = Math.floor(Math.random() * 100)
      result += num
    }
    setPassphrase(result)
  }, [wordCount, separator, capitalize, includeNumber])

  useEffect(() => {
    generate()
  }, [generate])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(passphrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const entropy = Math.round(wordCount * Math.log2(WORD_LIST.length) + (includeNumber ? Math.log2(100) : 0))

  return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-8">
        <div className="space-y-8">
          {/* Output Display */}
          <div className="relative group">
            <div className="p-6 bg-muted/30 border-2 border-dashed border-border/50 rounded-2xl text-center break-all transition-all group-hover:border-primary/30">
              <span className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-foreground select-all">
                {passphrase}
              </span>
            </div>
            <div className="flex justify-center mt-4 gap-3">
              <Button onClick={generate} variant="secondary" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t("generate")}
              </Button>
              <Button onClick={handleCopy} className="gap-2 min-w-[100px]">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : t("copy")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
            {/* Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">{t("settings") || "Settings"}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm">{t("wordCount")}</Label>
                    <span className="text-sm font-mono font-bold text-primary">{wordCount}</span>
                  </div>
                  <Slider
                    value={[wordCount]}
                    onValueChange={(v) => setWordCount(v[0])}
                    min={3}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t("separator")}</Label>
                  <Input
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="max-w-[100px] font-mono text-center bg-background/50"
                    maxLength={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="cap" checked={capitalize} onCheckedChange={(v) => setCapitalize(!!v)} />
                  <Label htmlFor="cap" className="text-sm cursor-pointer">{t("capitalize")}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="num" checked={includeNumber} onCheckedChange={(v) => setIncludeNumber(!!v)} />
                  <Label htmlFor="num" className="text-sm cursor-pointer">{t("addNumber")}</Label>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">{t("strength")}</h3>
              </div>
              <GlassCard className="p-4 bg-emerald-500/5 border-emerald-500/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-muted-foreground">{t("entropy") || "Estimated Entropy"}</span>
                    <span className="text-lg font-bold text-emerald-600">{entropy} bits</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (entropy / 80) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed italic">
                    {t("features.f1.desc")}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
