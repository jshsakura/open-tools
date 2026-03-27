"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Play, Pause, Square, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function TextToSpeechTool() {
    const t = useTranslations("TextToSpeech")
    const [text, setText] = useState("")
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoice, setSelectedVoice] = useState("")
    const [rate, setRate] = useState(1)
    const [pitch, setPitch] = useState(1)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState(-1)
    const [supported, setSupported] = useState(true)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            setSupported(false)
            return
        }

        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices()
            if (v.length > 0) {
                setVoices(v)
                if (!selectedVoice && v.length > 0) {
                    const defaultV = v.find((voice) => voice.default) || v[0]
                    setSelectedVoice(defaultV.name)
                }
            }
        }

        loadVoices()
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
            window.speechSynthesis.cancel()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePlay = useCallback(() => {
        if (!text.trim()) {
            toast.error(t("emptyText"))
            return
        }
        if (isPaused) {
            window.speechSynthesis.resume()
            setIsPaused(false)
            setIsPlaying(true)
            return
        }

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const voice = voices.find((v) => v.name === selectedVoice)
        if (voice) utterance.voice = voice
        utterance.rate = rate
        utterance.pitch = pitch

        utterance.onboundary = (e) => {
            if (e.name === "word") {
                setHighlightIndex(e.charIndex)
            }
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setIsPaused(false)
            setHighlightIndex(-1)
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setIsPaused(false)
            setHighlightIndex(-1)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
        setIsPaused(false)
    }, [text, isPaused, voices, selectedVoice, rate, pitch, t])

    const handlePause = () => {
        window.speechSynthesis.pause()
        setIsPaused(true)
        setIsPlaying(false)
    }

    const handleStop = () => {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        setIsPaused(false)
        setHighlightIndex(-1)
    }

    const renderHighlightedText = () => {
        if (highlightIndex < 0 || !text) return text

        const words = text.split(/(\s+)/)
        let charCount = 0
        return words.map((word, i) => {
            const start = charCount
            charCount += word.length
            const isHighlighted = highlightIndex >= start && highlightIndex < charCount
            return (
                <span
                    key={i}
                    className={isHighlighted ? "bg-primary text-primary-foreground px-0.5 rounded" : ""}
                >
                    {word}
                </span>
            )
        })
    }

    if (!supported) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Volume2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("notSupported")}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>{t("textInput")}</Label>
                            <span className="text-xs text-muted-foreground">
                                {text.length} {t("characters")}
                            </span>
                        </div>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t("placeholder")}
                            className="min-h-[200px] resize-none"
                        />

                        {/* Highlighted text preview */}
                        {(isPlaying || isPaused) && highlightIndex >= 0 && (
                            <div className="p-4 bg-secondary/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                {renderHighlightedText()}
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            {!isPlaying ? (
                                <Button onClick={handlePlay}>
                                    <Play className="w-4 h-4 mr-2" />
                                    {isPaused ? t("resume") : t("play")}
                                </Button>
                            ) : (
                                <Button onClick={handlePause} variant="secondary">
                                    <Pause className="w-4 h-4 mr-2" />
                                    {t("pause")}
                                </Button>
                            )}
                            <Button
                                onClick={handleStop}
                                variant="outline"
                                disabled={!isPlaying && !isPaused}
                            >
                                <Square className="w-4 h-4 mr-2" />
                                {t("stop")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <h3 className="font-semibold">{t("settings")}</h3>

                        {/* Voice */}
                        <div className="space-y-2">
                            <Label>{t("voice")}</Label>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectVoice")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {voices.map((v) => (
                                        <SelectItem key={v.name} value={v.name}>
                                            {v.name} ({v.lang})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Speed */}
                        <div className="space-y-2">
                            <Label>{t("speed")}: {rate.toFixed(1)}x</Label>
                            <Slider
                                value={[rate]}
                                onValueChange={([v]) => setRate(v)}
                                min={0.5}
                                max={2}
                                step={0.1}
                            />
                        </div>

                        {/* Pitch */}
                        <div className="space-y-2">
                            <Label>{t("pitch")}: {pitch.toFixed(1)}</Label>
                            <Slider
                                value={[pitch]}
                                onValueChange={([v]) => setPitch(v)}
                                min={0.5}
                                max={2}
                                step={0.1}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
