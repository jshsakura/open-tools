"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  Radio,
  Copy,
  Trash2,
  Check,
  Play,
  Square,
  ArrowRightLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/glass-card"
import { morseToText, textToMorse } from "./morse-converter.utils"

const DEFAULT_WPM = 15
const MIN_WPM = 5
const MAX_WPM = 40
const DEFAULT_FREQUENCY = 600
const MIN_FREQUENCY = 300
const MAX_FREQUENCY = 1000

// PARIS standard: dot time (seconds) = 1.2 / WPM.
const dotTimeForWpm = (wpm: number) => 1.2 / wpm

export function MorseConverter() {
  const t = useTranslations("MorseConverter")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isMorseToText, setIsMorseToText] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpm] = useState(DEFAULT_WPM)
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY)

  const audioCtxRef = useRef<AudioContext | null>(null)
  // Track every scheduled node so Stop can tear them all down.
  const activeNodesRef = useRef<AudioNode[]>([])
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!input.trim()) {
      setOutput("")
      return
    }
    setOutput(isMorseToText ? morseToText(input) : textToMorse(input))
  }, [input, isMorseToText])

  const stopPlayback = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    for (const node of activeNodesRef.current) {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          ;(node as OscillatorNode).stop()
        }
        node.disconnect()
      } catch {
        // Node may already be stopped/disconnected; ignore.
      }
    }
    activeNodesRef.current = []
    setIsPlaying(false)
  }, [])

  // Clean up audio on unmount.
  useEffect(() => {
    return () => {
      stopPlayback()
      audioCtxRef.current?.close().catch(() => {})
    }
  }, [stopPlayback])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playMorse = useCallback(() => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    const morse = isMorseToText ? input : output
    if (!morse) return

    let ctx = audioCtxRef.current
    if (!ctx) {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioCtxRef.current = ctx
    }
    void ctx.resume()

    setIsPlaying(true)
    activeNodesRef.current = []

    const dotTime = dotTimeForWpm(wpm)
    let currentTime = ctx.currentTime

    const playTone = (duration: number) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(frequency, currentTime)
      gain.gain.setValueAtTime(0.0001, currentTime)
      gain.gain.exponentialRampToValueAtTime(0.2, currentTime + 0.005)
      gain.gain.setValueAtTime(0.2, currentTime + duration - 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx!.destination)
      osc.start(currentTime)
      osc.stop(currentTime + duration)
      activeNodesRef.current.push(osc, gain)
      currentTime += duration + dotTime
    }

    for (const char of morse) {
      if (char === ".") playTone(dotTime)
      else if (char === "-") playTone(dotTime * 3)
      else if (char === " ") currentTime += dotTime * 2
      else if (char === "/") currentTime += dotTime * 4
    }

    const totalMs = (currentTime - ctx.currentTime) * 1000
    stopTimerRef.current = setTimeout(() => {
      activeNodesRef.current = []
      setIsPlaying(false)
    }, totalMs)
  }, [isPlaying, isMorseToText, input, output, wpm, frequency, stopPlayback])

  const playDisabled = !output && !(isMorseToText && input)

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                {isMorseToText ? t("morseLabel") : t("textLabel")}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMorseToText(!isMorseToText)}
                className="h-7 text-xs"
              >
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                {t("switch")}
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
                {isMorseToText ? t("textResult") : t("morseResult")}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playMorse}
                  disabled={playDisabled}
                  className="h-7 text-xs bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-600"
                >
                  {isPlaying ? <Square className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                  {isPlaying ? t("stop") : t("play")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className="h-7 text-xs"
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? t("copied") : t("copy")}
                </Button>
              </div>
            </div>
            <div className="min-h-[200px] p-4 rounded-md bg-muted/30 border border-border/50 font-mono text-xl break-all">
              {output || <span className="text-muted-foreground/30 italic">{t("resultPlaceholder")}</span>}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">{t("speed")}</Label>
              <span className="text-xs font-mono text-muted-foreground">{wpm} {t("wpm")}</span>
            </div>
            <Slider
              value={[wpm]}
              min={MIN_WPM}
              max={MAX_WPM}
              step={1}
              onValueChange={([v]) => setWpm(v)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">{t("frequency")}</Label>
              <span className="text-xs font-mono text-muted-foreground">{frequency} {t("hz")}</span>
            </div>
            <Slider
              value={[frequency]}
              min={MIN_FREQUENCY}
              max={MAX_FREQUENCY}
              step={10}
              onValueChange={([v]) => setFrequency(v)}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopPlayback()
            setInput("")
            setOutput("")
          }}
          className="mt-4 text-xs text-muted-foreground"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {t("clear")}
        </Button>
      </GlassCard>
    </div>
  )
}
