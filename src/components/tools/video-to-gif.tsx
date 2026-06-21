"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Upload, Film, Download, Loader2, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildGifArgs, parseTimeToSeconds, formatSeconds } from "./video-to-gif.utils"

const WIDTH_PRESETS = ["240", "320", "480", "640", "800"]
const DEFAULT_FPS = 12
const DEFAULT_WIDTH = "480"
const DEFAULT_DURATION = "5"

function inputNameFor(file: File): string {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4"
    return `input.${ext}`
}

export function VideoToGif() {
    const t = useTranslations("VideoToGif")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    // Options (kept as strings for free-form inputs; parsed at process time).
    const [fps, setFps] = useState(DEFAULT_FPS)
    const [width, setWidth] = useState(DEFAULT_WIDTH)
    const [startTime, setStartTime] = useState("0:00")
    const [duration, setDuration] = useState(DEFAULT_DURATION)

    // Load FFmpeg core lazily on mount.
    useEffect(() => {
        let cancelled = false
        load().then((ok) => {
            if (!ok && !cancelled) {
                toast.error(t("loadError"))
            }
        })
        return () => {
            cancelled = true
        }
    }, [load, t])

    // Revoke object URLs on unmount to avoid leaks.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (resultUrl) URL.revokeObjectURL(resultUrl)

        setVideoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setResultUrl(null)
    }

    const clearFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
    }

    const handleConvert = async () => {
        if (!videoFile || !loaded || processing) return
        setProcessing(true)

        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }

        try {
            const inputName = inputNameFor(videoFile)
            const outputName = "output.gif"
            const args = buildGifArgs({
                inputName,
                outputName,
                fps,
                width: Number(width) || Number(DEFAULT_WIDTH),
                start: parseTimeToSeconds(startTime),
                duration: parseTimeToSeconds(duration),
            })

            const blob = await run(inputName, videoFile, args, outputName, "image/gif")
            setResultUrl(URL.createObjectURL(blob))
            toast.success(t("success"))
        } catch (err) {
            console.error("GIF conversion error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: source preview / upload + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                    {isBusy && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loadingFfmpeg")}</p>
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
                                    {t("chooseVideo")}
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
                    <GlassCard className="p-6 rounded-xl border-primary/20 space-y-5 animate-in slide-in-from-left duration-300">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <ImageIcon className="w-5 h-5" />
                            {t("resultTitle")}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={resultUrl}
                            alt={t("resultTitle")}
                            className="w-full rounded-xl border border-border/30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMCcgaGVpZ2h0PScyMCc+PHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPScjY2NjJy8+PHJlY3QgeD0nMTAnIHk9JzEwJyB3aWR0aD0nMTAnIGhlaWdodD0nMTAnIGZpbGw9JyNjY2MnLz48L3N2Zz4=')]"
                        />
                        <Button asChild size="lg" className="w-full rounded-xl shadow-lg">
                            <a href={resultUrl} download="output.gif">
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: options */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-base">{t("fpsLabel")}</Label>
                            <span className="font-mono font-bold text-primary">{fps} FPS</span>
                        </div>
                        <Slider
                            value={[fps]}
                            onValueChange={([val]) => setFps(val)}
                            min={5}
                            max={30}
                            step={1}
                            disabled={!videoFile || processing}
                            className="py-4"
                        />
                        <p className="text-xs text-muted-foreground text-right">{t("fpsHint")}</p>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base">{t("widthLabel")}</Label>
                        <Select
                            value={width}
                            onValueChange={setWidth}
                            disabled={!videoFile || processing}
                        >
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {WIDTH_PRESETS.map((w) => (
                                    <SelectItem key={w} value={w}>
                                        {w} px
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground text-right">{t("widthHint")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("startLabel")}</Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="0:00"
                                className="font-mono h-11"
                                disabled={!videoFile || processing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("durationLabel")}</Label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="5"
                                className="font-mono h-11"
                                disabled={!videoFile || processing}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-4">
                        {t("trimHint", {
                            start: formatSeconds(parseTimeToSeconds(startTime)),
                            duration: formatSeconds(parseTimeToSeconds(duration)),
                        })}
                    </p>

                    <div className="mt-auto pt-4">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleConvert}
                            disabled={!videoFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Film className="mr-2" />
                            )}
                            {t("convertAction")}
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
