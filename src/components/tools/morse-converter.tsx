"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { 
  Radio, 
  Copy, 
  Trash2, 
  Check, 
  Play, 
  Square,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

const MORSE_CODE: Record<string, string> = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....",
  "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.",
  "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--",
  "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.",
  "$": "...-..-", "@": ".--.-.", " ": "/"
}

const REVERSE_MORSE = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]))

export function MorseConverter() {
  const t = useTranslations("MorseConverter")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isMorseToText, setIsMorseToText] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  useEffect(() => {
    if (!input.trim()) {
      setOutput("")
      return
    }

    if (isMorseToText) {
      const words = input.trim().split("  ")
      const decoded = words.map(word => 
        word.split(" ").map(char => REVERSE_MORSE[char] || "").join("")
      ).join(" ")
      setOutput(decoded)
    } else {
      const encoded = input.toUpperCase().split("").map(char => MORSE_CODE[char] || "").join(" ")
      setOutput(encoded)
    }
  }, [input, isMorseToText])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playMorse = useCallback(async () => {
    if (isPlaying) return
    
    const morse = isMorseToText ? input : output
    if (!morse) return

    let ctx = audioCtx
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioCtx(ctx)
    }

    setIsPlaying(true)
    const dotTime = 0.1
    let currentTime = ctx.currentTime

    const playTone = (duration: number) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(600, currentTime)
      gain.gain.setValueAtTime(0.1, currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx!.destination)
      osc.start(currentTime)
      osc.stop(currentTime + duration)
      currentTime += duration + dotTime
    }

    for (const char of morse) {
      if (!isPlaying && audioCtx) break // Stop if requested (simple check)
      if (char === ".") playTone(dotTime)
      else if (char === "-") playTone(dotTime * 3)
      else if (char === " ") currentTime += dotTime * 2
      else if (char === "/") currentTime += dotTime * 4
    }

    setTimeout(() => setIsPlaying(false), (currentTime - ctx.currentTime) * 1000)
  }, [output, isPlaying, audioCtx, input, isMorseToText])

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                {isMorseToText ? "Morse Code" : "Text"}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMorseToText(!isMorseToText)}
                className="h-7 text-xs"
              >
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                Switch
              </Button>
            </div>
            <Textarea
              placeholder={isMorseToText ? "... --- ..." : "HELLO"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-lg bg-background/30 focus:bg-background/50 transition-all"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                {isMorseToText ? "Text Result" : "Morse Result"}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playMorse}
                  disabled={isPlaying || !output}
                  className="h-7 text-xs bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-600"
                >
                  {isPlaying ? <Square className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                  {isPlaying ? "Playing..." : t("play")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className="h-7 text-xs"
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? "Copied" : t("copy")}
                </Button>
              </div>
            </div>
            <div className="min-h-[200px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-xl break-all">
              {output || <span className="text-muted-foreground/30 italic">Result...</span>}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setInput(""); setOutput(""); }}
          className="mt-4 text-xs text-muted-foreground"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {t("clear")}
        </Button>
      </GlassCard>
    </div>
  )
}
