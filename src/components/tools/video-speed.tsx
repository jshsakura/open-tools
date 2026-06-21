"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Gauge,
    Download,
    Loader2,
    X,
    FileVideo,
    Volume2,
    VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
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
import { buildSpeedArgs } from "./video-speed.utils"

const OUTPUT_NAME = "speed.mp4"
const OUTPUT_MIME = "video/mp4"

const SPEED_MIN = 0.25
const SPEED_MAX = 4
const SPEED_STEP = 0.05

const PRESETS = [0.25, 0.5, 1, 1.5, 2, 4] as const

export function VideoSpeed() {
    const t = useTranslations("VideoSpeed")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [speed, setSpeed] = useState(2)
    const [keepAudio, setKeepAudio] = useState(true)

    // Load FFmpeg once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs when they change / on unmount to avoid leaks.
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setVideoFile(file)
        setPreviewUrl(url)
        setResultUrl(null)
    }

    const clearFile = () => {
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
    }

    const handlePreset = (value: string) => {
        const next = Number(value)
        if (Number.isFinite(next)) setSpeed(next)
    }

    const handleSlider = ([next]: number[]) => {
        if (Number.isFinite(next)) setSpeed(next)
    }

    const handleRun = async () => {
        if (!videoFile || !loaded) return

        setProcessing(true)
        setResultUrl(null)

        try {
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const args = buildSpeedArgs({
                inputName,
                outputName: OUTPUT_NAME,
                speed,
                keepAudio,
            })

            const blob = await run(inputName, videoFile, args, OUTPUT_NAME, OUTPUT_MIME)
            const url = URL.createObjectURL(blob)
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Video speed error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded
    const speedLabel = `${Number(speed.toFixed(2))}x`

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
                                src={previewUrl ?? undefined}
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
                        <div className="rounded-xl overflow-hidden bg-black">
                            <video
                                src={resultUrl}
                                className="w-full max-h-64 object-contain"
                                controls
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

            {/* Right: Speed controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-8 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Gauge className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectPrompt")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Speed readout */}
                    <div className="text-center">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                            {t("speedLabel")}
                        </Label>
                        <div className="text-5xl font-mono font-bold text-primary">
                            {speedLabel}
                        </div>
                    </div>

                    {/* Preset select */}
                    <div className="space-y-2">
                        <Label>{t("presetLabel")}</Label>
                        <Select value={String(speed)} onValueChange={handlePreset}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("presetPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {PRESETS.map((preset) => (
                                    <SelectItem key={preset} value={String(preset)}>
                                        {`${preset}x`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fine slider */}
                    <div className="relative bg-secondary/20 rounded-xl p-4 border border-border/50">
                        <div className="flex justify-between text-[10px] text-muted-foreground/50 select-none font-mono mb-2">
                            <span>{SPEED_MIN}x</span>
                            <span>{SPEED_MAX}x</span>
                        </div>
                        <Slider
                            value={[speed]}
                            min={SPEED_MIN}
                            max={SPEED_MAX}
                            step={SPEED_STEP}
                            onValueChange={handleSlider}
                            className="py-4"
                        />
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            {t("sliderHint")}
                        </p>
                    </div>

                    {/* Audio toggle */}
                    <div className="space-y-3">
                        <Label className="text-base">{t("audioLabel")}</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setKeepAudio(true)}
                                className={cn(
                                    "text-left rounded-xl border-2 p-4 transition-all",
                                    keepAudio
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                )}
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <Volume2 className="w-4 h-4 text-primary" />
                                    {t("audioKeep")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("audioKeepDesc")}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setKeepAudio(false)}
                                className={cn(
                                    "text-left rounded-xl border-2 p-4 transition-all",
                                    !keepAudio
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                )}
                            >
                                <div className="flex items-center gap-2 font-bold">
                                    <VolumeX className="w-4 h-4 text-primary" />
                                    {t("audioDrop")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("audioDropDesc")}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleRun}
                            disabled={!videoFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Gauge className="mr-2" />
                            )}
                            {t("runAction")}
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
