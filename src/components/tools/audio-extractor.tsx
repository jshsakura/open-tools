"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Video,
    Music,
    Download,
    Loader2,
    X,
    Scissors,
    FileAudio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import {
    AUDIO_FORMATS,
    type AudioFormat,
    buildExtractArgs,
} from "./audio-extractor.utils"

const FORMATS: AudioFormat[] = ["mp3", "wav", "aac", "ogg"]
const BITRATES = ["320k", "256k", "192k", "128k"] as const

export function AudioExtractor() {
    const t = useTranslations("AudioExtractor")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [resultName, setResultName] = useState("")
    const [processing, setProcessing] = useState(false)

    const [format, setFormat] = useState<AudioFormat>("mp3")
    const [bitrate, setBitrate] = useState<string>("192k")
    const [start, setStart] = useState(0)
    const [duration, setDuration] = useState(0)

    const previewRef = useRef<string | null>(null)
    const resultRef = useRef<string | null>(null)

    // Load FFmpeg once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs on unmount.
    useEffect(() => {
        return () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current)
            if (resultRef.current) URL.revokeObjectURL(resultRef.current)
        }
    }, [])

    const isLossy = AUDIO_FORMATS[format].lossy

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (previewRef.current) URL.revokeObjectURL(previewRef.current)
        if (resultRef.current) URL.revokeObjectURL(resultRef.current)

        const url = URL.createObjectURL(file)
        previewRef.current = url
        resultRef.current = null

        setVideoFile(file)
        setPreviewUrl(url)
        setResultUrl(null)
        setResultName("")
        setStart(0)
        setDuration(0)
    }

    const clearFile = () => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current)
        if (resultRef.current) URL.revokeObjectURL(resultRef.current)
        previewRef.current = null
        resultRef.current = null
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
        setResultName("")
    }

    const extract = async () => {
        if (!videoFile || !loaded || processing) return
        setProcessing(true)

        try {
            const info = AUDIO_FORMATS[format]
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const outputName = `audio.${info.ext}`

            const args = buildExtractArgs({
                inputName,
                outputName,
                format,
                bitrate: isLossy ? bitrate : undefined,
                start: start > 0 ? start : undefined,
                duration: duration > 0 ? duration : undefined,
            })

            const blob = await run(inputName, videoFile, args, outputName, info.mime)

            if (resultRef.current) URL.revokeObjectURL(resultRef.current)
            const url = URL.createObjectURL(blob)
            resultRef.current = url

            const baseName = videoFile.name.replace(/\.[^.]+$/, "") || "audio"
            setResultUrl(url)
            setResultName(`${baseName}.${info.ext}`)
            toast.success(t("success"))
        } catch (err) {
            console.error("Audio extraction error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: source preview + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                    {(loading || !loaded) && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loading")}</p>
                        </div>
                    )}

                    {!videoFile ? (
                        <div className="relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("uploadTitle")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">{t("uploadHint")}</p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseFile")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video
                                src={previewUrl!}
                                className="w-full h-full object-contain"
                                controls
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={clearFile}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {resultUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileAudio className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground truncate">{resultName}</p>
                            </div>
                        </div>
                        <audio src={resultUrl} controls className="w-full" />
                        <Button asChild size="lg" className="rounded-xl shadow-lg w-full">
                            <a href={resultUrl} download={resultName}>
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: options */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 relative space-y-6">
                        {!videoFile && (
                            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Video className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-muted-foreground">{t("selectPrompt")}</p>
                                </div>
                            </div>
                        )}

                        {/* Format */}
                        <div className="space-y-4">
                            <Label className="text-base">{t("formatLabel")}</Label>
                            <div className="grid grid-cols-4 gap-3">
                                {FORMATS.map((fmt) => (
                                    <div
                                        key={fmt}
                                        onClick={() => setFormat(fmt)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-3 text-center transition-all",
                                            format === fmt
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                        )}
                                    >
                                        <span className="font-mono font-bold uppercase text-sm">
                                            {AUDIO_FORMATS[fmt].ext}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bitrate (lossy only) */}
                        <div className="space-y-4">
                            <Label className="text-base">{t("bitrateLabel")}</Label>
                            <Select
                                value={bitrate}
                                onValueChange={setBitrate}
                                disabled={!videoFile || !isLossy}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BITRATES.map((b) => (
                                        <SelectItem key={b} value={b}>
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!isLossy && (
                                <p className="text-xs text-muted-foreground">{t("losslessNote")}</p>
                            )}
                        </div>

                        {/* Trim */}
                        <div className="space-y-4">
                            <Label className="text-base flex items-center gap-2">
                                <Scissors className="w-4 h-4" />
                                {t("trimLabel")}
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t("startLabel")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        value={start}
                                        onChange={(e) => setStart(Math.max(0, Number(e.target.value)))}
                                        className="font-mono h-11"
                                        disabled={!videoFile}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t("durationLabel")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.1}
                                        value={duration}
                                        onChange={(e) => setDuration(Math.max(0, Number(e.target.value)))}
                                        className="font-mono h-11"
                                        disabled={!videoFile}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("trimHint")}</p>
                        </div>

                        <div className="mt-auto pt-4">
                            <Button
                                className="w-full h-14 text-lg rounded-xl shadow-lg"
                                onClick={extract}
                                disabled={!videoFile || !loaded || processing}
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <Music className="mr-2" />
                                )}
                                {t("extractAction")}
                            </Button>

                            {processing && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{t("processing")}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
