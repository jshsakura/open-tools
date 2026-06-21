"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { fetchFile } from "@ffmpeg/util"
import JSZip from "jszip"
import {
    Upload,
    Images,
    Download,
    Loader2,
    X,
    Film,
    ImageIcon,
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
    buildFramesArgs,
    buildThumbnailArgs,
    frameMime,
    FRAME_PATTERN,
    type FrameFormat,
} from "./video-frames.utils"

// Max number of frame thumbnails rendered in the preview grid.
const PREVIEW_LIMIT = 12
// Cap on sequential frame files we attempt to read back from the FS.
const MAX_FRAMES = 2000

type ExtractMode = "fps" | "interval"

interface ExtractedFrame {
    name: string
    url: string
    bytes: Uint8Array
}

export function VideoFrames() {
    const t = useTranslations("VideoFrames")
    const { ffmpeg, load, loaded, loading } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [mode, setMode] = useState<ExtractMode>("fps")
    const [fps, setFps] = useState("1")
    const [interval, setInterval] = useState("2")
    const [format, setFormat] = useState<FrameFormat>("png")
    const [thumbTime, setThumbTime] = useState("0")

    const [frames, setFrames] = useState<ExtractedFrame[]>([])
    const [thumbUrl, setThumbUrl] = useState<string | null>(null)

    // Load FFmpeg on mount.
    useEffect(() => {
        load()
    }, [load])

    // Revoke object URLs on unmount / when inputs change.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const clearResults = () => {
        setFrames((prev) => {
            prev.forEach((f) => URL.revokeObjectURL(f.url))
            return []
        })
        setThumbUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        clearResults()
        setVideoFile(file)
        setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return URL.createObjectURL(file)
        })
    }

    const resetFile = () => {
        clearResults()
        setVideoFile(null)
        setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
        })
    }

    const inputName = (file: File) => `input.${file.name.split(".").pop() || "mp4"}`

    // Effective frame rate from the selected mode.
    const effectiveRate = (): number => {
        if (mode === "fps") return Number(fps)
        const sec = Number(interval)
        return sec > 0 ? 1 / sec : 1
    }

    const extractFrames = async () => {
        const ff = ffmpeg.current
        if (!videoFile || !loaded || !ff) return

        const rate = effectiveRate()
        if (!Number.isFinite(rate) || rate <= 0) {
            toast.error(t("errors.invalidRate"))
            return
        }

        setProcessing(true)
        clearResults()
        const name = inputName(videoFile)

        try {
            await ff.writeFile(name, await fetchFile(videoFile))
            await ff.exec(
                buildFramesArgs({ inputName: name, fps: rate, format, pattern: FRAME_PATTERN }),
            )

            const collected = await readSequentialFrames(ff, format)

            if (collected.length === 0) {
                toast.error(t("errors.noFrames"))
                return
            }

            setFrames(collected)
            toast.success(t("toast.extracted", { count: collected.length }))
        } catch (err) {
            console.error("Frame extraction error:", err)
            toast.error(t("errors.failed"))
        } finally {
            // Best-effort cleanup of the input and generated frames.
            try {
                await ff.deleteFile(name)
            } catch {
                // ignore
            }
            setProcessing(false)
        }
    }

    // Read frame_0001.<ext>, frame_0002.<ext>, ... until a read fails.
    const readSequentialFrames = async (
        ff: NonNullable<typeof ffmpeg.current>,
        fmt: FrameFormat,
    ): Promise<ExtractedFrame[]> => {
        const mime = frameMime(fmt)
        const out: ExtractedFrame[] = []

        for (let i = 1; i <= MAX_FRAMES; i++) {
            const padded = String(i).padStart(4, "0")
            const fileName = `frame_${padded}.${fmt}`
            try {
                const data = (await ff.readFile(fileName)) as Uint8Array
                const bytes = data.slice()
                const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime }))
                out.push({ name: fileName, url, bytes })
                await ff.deleteFile(fileName)
            } catch {
                // No more sequential frames.
                break
            }
        }

        return out
    }

    const extractThumbnail = async () => {
        const ff = ffmpeg.current
        if (!videoFile || !loaded || !ff) return

        const time = Number(thumbTime)
        if (!Number.isFinite(time) || time < 0) {
            toast.error(t("errors.invalidTime"))
            return
        }

        setProcessing(true)
        clearResults()
        const name = inputName(videoFile)
        const outputName = `thumb.${format}`

        try {
            await ff.writeFile(name, await fetchFile(videoFile))
            await ff.exec(buildThumbnailArgs({ inputName: name, time, outputName }))

            const data = (await ff.readFile(outputName)) as Uint8Array
            const bytes = data.slice()
            const url = URL.createObjectURL(
                new Blob([bytes as BlobPart], { type: frameMime(format) }),
            )
            setThumbUrl(url)
            toast.success(t("toast.thumbnail"))

            try {
                await ff.deleteFile(outputName)
            } catch {
                // ignore
            }
        } catch (err) {
            console.error("Thumbnail error:", err)
            toast.error(t("errors.failed"))
        } finally {
            try {
                await ff.deleteFile(name)
            } catch {
                // ignore
            }
            setProcessing(false)
        }
    }

    const downloadZip = async () => {
        if (frames.length === 0) return
        try {
            const zip = new JSZip()
            frames.forEach((f) => zip.file(f.name, f.bytes))
            const blob = await zip.generateAsync({ type: "blob" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `frames-${format}.zip`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error("ZIP error:", err)
            toast.error(t("errors.zipFailed"))
        }
    }

    const busy = processing || !loaded

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: upload / preview */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    {(loading || !loaded) && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("ffmpegLoading")}</p>
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
                                    <p className="text-2xl font-bold">{t("inputPlaceholder")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">MP4, WebM, MOV, AVI</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video src={previewUrl!} className="w-full h-full object-contain" controls />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={resetFile}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {/* Thumbnail result */}
                {thumbUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            {t("thumbnail.result")}
                        </h3>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbUrl} alt="thumbnail" className="w-full rounded-lg border border-border/30" />
                        <Button asChild className="w-full rounded-xl">
                            <a href={thumbUrl} download={`thumbnail.${format}`}>
                                <Download className="mr-2 h-4 w-4" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}

                {/* Frames grid + ZIP */}
                {frames.length > 0 && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <Images className="w-5 h-5 text-primary" />
                                {t("frames.count", { count: frames.length })}
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {frames.slice(0, PREVIEW_LIMIT).map((f) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={f.name}
                                    src={f.url}
                                    alt={f.name}
                                    className="w-full aspect-video object-cover rounded-md border border-border/30"
                                />
                            ))}
                        </div>
                        {frames.length > PREVIEW_LIMIT && (
                            <p className="text-xs text-muted-foreground text-center">
                                {t("frames.more", { count: frames.length - PREVIEW_LIMIT })}
                            </p>
                        )}
                        <Button onClick={downloadZip} className="w-full h-12 rounded-xl shadow-lg">
                            <Download className="mr-2 h-5 w-5" />
                            {t("downloadZip")}
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-6 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Film className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">{t("selectPrompt")}</p>
                            </div>
                        </div>
                    )}

                    {/* Extract frames section */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold">{t("extract.title")}</h3>

                        <div className="space-y-2">
                            <Label>{t("mode.label")}</Label>
                            <Select value={mode} onValueChange={(v) => setMode(v as ExtractMode)} disabled={busy}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fps">{t("mode.fps")}</SelectItem>
                                    <SelectItem value="interval">{t("mode.interval")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === "fps" ? (
                            <div className="space-y-2">
                                <Label>{t("fps.label")}</Label>
                                <Input
                                    type="number"
                                    min={0.1}
                                    step={0.1}
                                    value={fps}
                                    onChange={(e) => setFps(e.target.value)}
                                    disabled={busy}
                                    className="h-11 font-mono"
                                />
                                <p className="text-xs text-muted-foreground">{t("fps.hint")}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>{t("interval.label")}</Label>
                                <Input
                                    type="number"
                                    min={0.1}
                                    step={0.1}
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                    disabled={busy}
                                    className="h-11 font-mono"
                                />
                                <p className="text-xs text-muted-foreground">{t("interval.hint")}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>{t("format.label")}</Label>
                            <Select value={format} onValueChange={(v) => setFormat(v as FrameFormat)} disabled={busy}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="png">PNG</SelectItem>
                                    <SelectItem value="jpg">JPG</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full h-12 rounded-xl shadow-lg"
                            onClick={extractFrames}
                            disabled={busy}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                            ) : (
                                <Images className="mr-2 h-5 w-5" />
                            )}
                            {processing ? t("processing") : t("extract.action")}
                        </Button>
                    </div>

                    <div className="h-px bg-border/30" />

                    {/* Quick thumbnail section */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold">{t("thumbnail.title")}</h3>
                        <div className="space-y-2">
                            <Label>{t("thumbnail.time")}</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.5}
                                value={thumbTime}
                                onChange={(e) => setThumbTime(e.target.value)}
                                disabled={busy}
                                className="h-11 font-mono"
                            />
                            <p className="text-xs text-muted-foreground">{t("thumbnail.hint")}</p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full h-12 rounded-xl"
                            onClick={extractThumbnail}
                            disabled={busy}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                            ) : (
                                <ImageIcon className="mr-2 h-5 w-5" />
                            )}
                            {t("thumbnail.action")}
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
