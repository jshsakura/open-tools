"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Repeat,
    Download,
    Loader2,
    X,
    FileVideo,
    Hash,
    Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildLoopArgs, estimatedDuration } from "./video-loop.utils"

type LoopMode = "count" | "duration"

const OUTPUT_NAME = "looped.mp4"
const OUTPUT_MIME = "video/mp4"

const MIN_REPEAT = 2
const MAX_REPEAT = 10
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

const REPEAT_OPTIONS = Array.from(
    { length: MAX_REPEAT - MIN_REPEAT + 1 },
    (_, i) => MIN_REPEAT + i,
)

function formatSeconds(n: number): string {
    const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
    const hours = Math.floor(safe / SECONDS_PER_HOUR)
    const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const seconds = safe % SECONDS_PER_MINUTE
    const pad = (v: number) => String(v).padStart(2, "0")
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function VideoLoop() {
    const t = useTranslations("VideoLoop")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [duration, setDuration] = useState(0)
    const [mode, setMode] = useState<LoopMode>("count")
    const [repeatCount, setRepeatCount] = useState(MIN_REPEAT)
    const [targetSeconds, setTargetSeconds] = useState(0)

    const videoRef = useRef<HTMLVideoElement>(null)

    // Load FFmpeg once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs to avoid leaks.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        return () => {
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
    }, [resultUrl])

    // Derive the effective number of total plays from the active mode.
    const totalPlays =
        mode === "count"
            ? repeatCount
            : duration > 0 && targetSeconds > 0
              ? Math.max(1, Math.ceil(targetSeconds / duration))
              : 1

    const resultSeconds = estimatedDuration(duration, totalPlays)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setVideoFile(file)
        setPreviewUrl(url)
        setResultUrl(null)
        setDuration(0)
        setRepeatCount(MIN_REPEAT)
        setTargetSeconds(0)
    }

    const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        if (!Number.isFinite(video.duration)) return
        setDuration(video.duration)
        setTargetSeconds(Math.round(video.duration * MIN_REPEAT))
    }

    const clearFile = () => {
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
        setDuration(0)
        setRepeatCount(MIN_REPEAT)
        setTargetSeconds(0)
    }

    const handleTargetInput = (value: string) => {
        const seconds = Number(value)
        if (!Number.isFinite(seconds) || seconds < 0) return
        setTargetSeconds(seconds)
    }

    const handleLoop = async () => {
        if (!videoFile || !loaded) return

        if (totalPlays < 1) {
            toast.error(t("invalidCount"))
            return
        }

        setProcessing(true)
        setResultUrl(null)

        try {
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const args = buildLoopArgs({
                inputName,
                outputName: OUTPUT_NAME,
                totalPlays,
            })

            const blob = await run(inputName, videoFile, args, OUTPUT_NAME, OUTPUT_MIME)
            const url = URL.createObjectURL(blob)
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Video loop error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: Upload / Preview / Result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    {isBusy && (
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
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t("uploadHint")}
                                    </p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseVideo")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video
                                ref={videoRef}
                                src={previewUrl ?? undefined}
                                className="w-full h-full object-contain"
                                controls
                                onLoadedMetadata={onLoadedMetadata}
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
                        <div className="rounded-xl overflow-hidden bg-black">
                            <video
                                src={resultUrl}
                                className="w-full max-h-64 object-contain"
                                controls
                                loop
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileVideo className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground">{OUTPUT_NAME}</p>
                            </div>
                            <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
                                <a href={resultUrl} download={OUTPUT_NAME}>
                                    <Download className="mr-2 h-5 w-5" />
                                    {t("download")}
                                </a>
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Right: Loop controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-8 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Repeat className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectPrompt")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Duration readout */}
                    <div className="flex justify-between items-end px-2">
                        <div className="text-center">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                                {t("originalDuration")}
                            </Label>
                            <div className="text-2xl font-mono font-bold text-muted-foreground">
                                {formatSeconds(duration)}
                            </div>
                        </div>
                        <div className="pb-1 text-muted-foreground">
                            <Repeat className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                                {t("resultDuration")}
                            </Label>
                            <div className="text-2xl font-mono font-bold text-primary">
                                {formatSeconds(resultSeconds)}
                            </div>
                        </div>
                    </div>

                    {/* Mode selector */}
                    <div className="space-y-3">
                        <Label className="text-base">{t("modeLabel")}</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setMode("count")}
                                className={cn(
                                    "text-left rounded-xl border-2 p-4 transition-all",
                                    mode === "count"
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                )}
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <Hash className="w-4 h-4 text-primary" />
                                    {t("modeCount")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("modeCountDesc")}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("duration")}
                                className={cn(
                                    "text-left rounded-xl border-2 p-4 transition-all",
                                    mode === "duration"
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                )}
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <Timer className="w-4 h-4 text-primary" />
                                    {t("modeDuration")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("modeDurationDesc")}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Mode-specific control */}
                    {mode === "count" ? (
                        <div className="space-y-2">
                            <Label>{t("repeatLabel")}</Label>
                            <Select
                                value={String(repeatCount)}
                                onValueChange={(v) => setRepeatCount(Number(v))}
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPEAT_OPTIONS.map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {t("repeatOption", { count: n })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {t("repeatHint")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>{t("targetLabel")}</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={targetSeconds || ""}
                                onChange={(e) => handleTargetInput(e.target.value)}
                                className="h-11"
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("targetHint", { plays: totalPlays })}
                            </p>
                        </div>
                    )}

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleLoop}
                            disabled={!videoFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Repeat className="mr-2" />
                            )}
                            {t("loopAction")}
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
                </GlassCard>
            </div>
        </div>
    )
}
