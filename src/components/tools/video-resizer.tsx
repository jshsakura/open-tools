"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Scaling,
    Download,
    Loader2,
    X,
    FileVideo,
    Lock,
    ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import {
    buildResizeArgs,
    PRESET_HEIGHTS,
    type PresetKey,
} from "./video-resizer.utils"

const OUTPUT_NAME = "resized.mp4"
const OUTPUT_MIME = "video/mp4"
const CUSTOM_KEY = "custom"

type ResolutionMode = PresetKey | typeof CUSTOM_KEY

const PRESET_KEYS = Object.keys(PRESET_HEIGHTS) as PresetKey[]

interface Dimensions {
    width: number
    height: number
}

/** Derive target dimensions for a preset height from the source aspect ratio. */
function presetToDimensions(preset: PresetKey, source: Dimensions): Dimensions {
    const targetHeight = PRESET_HEIGHTS[preset]
    if (source.height <= 0) {
        return { width: 0, height: targetHeight }
    }
    const ratio = source.width / source.height
    const width = Math.max(2, Math.round(targetHeight * ratio))
    return { width, height: targetHeight }
}

export function VideoResizer() {
    const t = useTranslations("VideoResizer")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [source, setSource] = useState<Dimensions>({ width: 0, height: 0 })
    const [mode, setMode] = useState<ResolutionMode>("720p")
    const [lockAspect, setLockAspect] = useState(true)
    const [customWidth, setCustomWidth] = useState(1280)
    const [customHeight, setCustomHeight] = useState(720)

    const videoRef = useRef<HTMLVideoElement>(null)

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
        setSource({ width: 0, height: 0 })
    }

    const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        const width = video.videoWidth
        const height = video.videoHeight
        if (!width || !height) return
        setSource({ width, height })
        setCustomWidth(width)
        setCustomHeight(height)
    }

    const clearFile = () => {
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
        setSource({ width: 0, height: 0 })
    }

    // Resolve the target dimensions for the current selection.
    const target: Dimensions =
        mode === CUSTOM_KEY
            ? { width: customWidth, height: customHeight }
            : presetToDimensions(mode, source)

    const handleCustomWidth = (value: string) => {
        const next = Number(value)
        if (!Number.isFinite(next) || next < 0) return
        setCustomWidth(Math.floor(next))
    }

    const handleCustomHeight = (value: string) => {
        const next = Number(value)
        if (!Number.isFinite(next) || next < 0) return
        setCustomHeight(Math.floor(next))
    }

    const handleResize = async () => {
        if (!videoFile || !loaded) return

        if (target.width <= 0 || (!lockAspect && target.height <= 0)) {
            toast.error(t("invalidSize"))
            return
        }

        setProcessing(true)
        setResultUrl(null)

        try {
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const args = buildResizeArgs({
                inputName,
                outputName: OUTPUT_NAME,
                width: target.width,
                height: target.height,
                lockAspect,
            })

            const blob = await run(inputName, videoFile, args, OUTPUT_NAME, OUTPUT_MIME)
            const url = URL.createObjectURL(blob)
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Video resize error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded
    const hasSource = source.width > 0 && source.height > 0

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

                {/* Resolution comparison */}
                {hasSource && (
                    <GlassCard className="p-6 rounded-xl flex items-center justify-around gap-4 text-center">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                                {t("original")}
                            </Label>
                            <div className="text-2xl font-mono font-bold">
                                {source.width}×{source.height}
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground shrink-0" />
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                                {t("newSize")}
                            </Label>
                            <div className="text-2xl font-mono font-bold text-primary">
                                {target.width}
                                {lockAspect ? "×auto" : `×${target.height}`}
                            </div>
                        </div>
                    </GlassCard>
                )}

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

            {/* Right: Resize controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-8 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Scaling className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectPrompt")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resolution preset */}
                    <div className="space-y-3">
                        <Label className="text-base">{t("resolutionLabel")}</Label>
                        <Select
                            value={mode}
                            onValueChange={(value) => setMode(value as ResolutionMode)}
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder={t("resolutionLabel")} />
                            </SelectTrigger>
                            <SelectContent>
                                {PRESET_KEYS.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {t(`preset.${key}`)}
                                    </SelectItem>
                                ))}
                                <SelectItem value={CUSTOM_KEY}>{t("customOption")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lock aspect ratio */}
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-primary" />
                            <div>
                                <Label className="text-sm font-medium">
                                    {t("lockAspect")}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {t("lockAspectDesc")}
                                </p>
                            </div>
                        </div>
                        <Switch checked={lockAspect} onCheckedChange={setLockAspect} />
                    </div>

                    {/* Custom dimensions */}
                    {mode === CUSTOM_KEY && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                            <div className="space-y-2">
                                <Label>{t("widthLabel")}</Label>
                                <Input
                                    type="number"
                                    min={2}
                                    value={customWidth}
                                    onChange={(e) => handleCustomWidth(e.target.value)}
                                    className="font-mono h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("heightLabel")}</Label>
                                <Input
                                    type="number"
                                    min={2}
                                    value={customHeight}
                                    onChange={(e) => handleCustomHeight(e.target.value)}
                                    disabled={lockAspect}
                                    className="font-mono h-11"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleResize}
                            disabled={!videoFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Scaling className="mr-2" />
                            )}
                            {t("resizeAction")}
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
