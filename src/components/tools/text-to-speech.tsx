"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Play, Pause, Square, Volume2, Circle, Download, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
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
    const [volume, setVolume] = useState(1)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState(-1)
    const [supported, setSupported] = useState(true)

    // Recording (best-effort via tab/display audio capture)
    const [recordEnabled, setRecordEnabled] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [canRecord, setCanRecord] = useState(false)

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const recorderRef = useRef<MediaRecorder | null>(null)
    const recordStreamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            setSupported(false)
            return
        }

        setCanRecord(
            typeof navigator !== "undefined" &&
            !!navigator.mediaDevices?.getDisplayMedia &&
            typeof window.MediaRecorder !== "undefined"
        )

        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices()
            if (v.length > 0) {
                setVoices(v)
                setSelectedVoice((prev) => {
                    if (prev) return prev
                    const defaultV = v.find((voice) => voice.default) || v[0]
                    return defaultV.name
                })
            }
        }

        loadVoices()
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
            window.speechSynthesis.cancel()
        }
    }, [])

    // Revoke object URL on unmount / replacement
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl)
        }
    }, [audioUrl])

    const stopRecording = useCallback(() => {
        const recorder = recorderRef.current
        if (recorder && recorder.state !== "inactive") {
            recorder.stop()
        }
        recordStreamRef.current?.getTracks().forEach((track) => track.stop())
        recordStreamRef.current = null
        recorderRef.current = null
        setIsRecording(false)
    }, [])

    // Start a best-effort capture of the tab's audio output.
    const startRecording = useCallback(async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            })
            const audioTracks = stream.getAudioTracks()
            if (audioTracks.length === 0) {
                stream.getTracks().forEach((track) => track.stop())
                toast.error(t("recordNoAudio"))
                return false
            }
            // Drop video tracks — we only want audio.
            stream.getVideoTracks().forEach((track) => {
                track.stop()
                stream.removeTrack(track)
            })

            const recorder = new MediaRecorder(stream)
            chunksRef.current = []
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
                setAudioUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return URL.createObjectURL(blob)
                })
            }

            recordStreamRef.current = stream
            recorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
            return true
        } catch {
            toast.error(t("recordFailed"))
            return false
        }
    }, [t])

    const handlePlay = useCallback(async () => {
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

        if (recordEnabled && canRecord) {
            const started = await startRecording()
            if (!started) return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        const voice = voices.find((v) => v.name === selectedVoice)
        if (voice) utterance.voice = voice
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        utterance.onboundary = (e) => {
            if (e.name === "word") {
                setHighlightIndex(e.charIndex)
            }
        }

        utterance.onend = () => {
            setIsPlaying(false)
            setIsPaused(false)
            setHighlightIndex(-1)
            if (recorderRef.current) stopRecording()
        }

        utterance.onerror = () => {
            setIsPlaying(false)
            setIsPaused(false)
            setHighlightIndex(-1)
            if (recorderRef.current) stopRecording()
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
        setIsPaused(false)
    }, [
        text, isPaused, voices, selectedVoice, rate, pitch, volume,
        recordEnabled, canRecord, startRecording, stopRecording, t,
    ])

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
        if (recorderRef.current) stopRecording()
    }

    const downloadAudio = () => {
        if (!audioUrl) return
        const link = document.createElement("a")
        link.href = audioUrl
        link.download = "speech.webm"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
                        <div className="flex flex-wrap items-center gap-2">
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
                            {isRecording && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                                    <Circle className="w-3 h-3 fill-rose-500 animate-pulse" />
                                    {t("recording")}
                                </span>
                            )}
                            {audioUrl && !isRecording && (
                                <Button onClick={downloadAudio} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("saveAudio")}
                                </Button>
                            )}
                        </div>

                        {audioUrl && !isRecording && (
                            <audio src={audioUrl} controls className="w-full" />
                        )}
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

                        {/* Volume */}
                        <div className="space-y-2">
                            <Label>{t("volume")}: {Math.round(volume * 100)}%</Label>
                            <Slider
                                value={[volume]}
                                onValueChange={([v]) => setVolume(v)}
                                min={0}
                                max={1}
                                step={0.05}
                            />
                        </div>

                        {/* Record / save audio */}
                        {canRecord && (
                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="tts-record">{t("recordLabel")}</Label>
                                    <Switch
                                        id="tts-record"
                                        checked={recordEnabled}
                                        onCheckedChange={setRecordEnabled}
                                        disabled={isPlaying || isPaused || isRecording}
                                    />
                                </div>
                                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    {t("recordNote")}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
