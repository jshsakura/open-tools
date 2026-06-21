"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Crop,
    Download,
    Loader2,
    X,
    FileVideo,
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
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import {
    centeredCropForAspect,
    clampCrop,
    buildCropArgs,
    type CropRegion,
} from "./video-crop.utils"

const OUTPUT_NAME = "cropped.mp4"
const OUTPUT_MIME = "video/mp4"

interface AspectPreset {
    id: string
    arW: number
    arH: number
}

const ASPECT_PRESETS: readonly AspectPreset[] = [
    { id: "1:1", arW: 1, arH: 1 },
    { id: "4:3", arW: 4, arH: 3 },
    { id: "16:9", arW: 16, arH: 9 },
    { id: "9:16", arW: 9, arH: 16 },
    { id: "3:4", arW: 3, arH: 4 },
] as const

const CUSTOM_VALUE = "custom"

export function VideoCrop() {
    const t = useTranslations("VideoCrop")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [srcW, setSrcW] = useState(0)
    const [srcH, setSrcH] = useState(0)
    const [crop, setCrop] = useState<CropRegion>({ w: 0, h: 0, x: 0, y: 0 })
    const [presetId, setPresetId] = useState<string>(CUSTOM_VALUE)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setVideoFile(file)
        setPreviewUrl(url)
        setResultUrl(null)
        setSrcW(0)
        setSrcH(0)
        setCrop({ w: 0, h: 0, x: 0, y: 0 })
        setPresetId(CUSTOM_VALUE)
    }

    const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        const width = video.videoWidth
        const height = video.videoHeight
        if (!width || !height) return
        setSrcW(width)
        setSrcH(height)
        // Default crop = full frame.
        setCrop(clampCrop(width, height, { w: width, h: height, x: 0, y: 0 }))
    }

    const clearFile = () => {
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
        setSrcW(0)
        setSrcH(0)
        setCrop({ w: 0, h: 0, x: 0, y: 0 })
        setPresetId(CUSTOM_VALUE)
    }

    const handlePresetChange = (value: string) => {
        setPresetId(value)
        if (value === CUSTOM_VALUE || !srcW || !srcH) return
        const preset = ASPECT_PRESETS.find((p) => p.id === value)
        if (!preset) return
        setCrop(centeredCropForAspect(srcW, srcH, preset.arW, preset.arH))
    }

    const handleFieldChange = (field: keyof CropRegion, raw: string) => {
        const value = Number(raw)
        if (!Number.isFinite(value)) return
        // Manual edits switch back to a custom (free-form) crop.
        setPresetId(CUSTOM_VALUE)
        setCrop((prev) =>
            clampCrop(srcW || prev.w, srcH || prev.h, {
                ...prev,
                [field]: Math.max(0, Math.round(value)),
            }),
        )
    }

    const handleCrop = async () => {
        if (!videoFile || !loaded) return

        const safe = clampCrop(srcW, srcH, crop)
        if (safe.w < 2 || safe.h < 2) {
            toast.error(t("invalidCrop"))
            return
        }

        setProcessing(true)
        setResultUrl(null)

        try {
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const args = buildCropArgs({
                inputName,
                outputName: OUTPUT_NAME,
                w: safe.w,
                h: safe.h,
                x: safe.x,
                y: safe.y,
            })

            const blob = await run(inputName, videoFile, args, OUTPUT_NAME, OUTPUT_MIME)
            const url = URL.createObjectURL(blob)
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Video crop error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded
    const hasSource = srcW > 0 && srcH > 0

    // Overlay geometry as percentages of the source frame.
    const overlay = hasSource
        ? {
              left: `${(crop.x / srcW) * 100}%`,
              top: `${(crop.y / srcH) * 100}%`,
              width: `${(crop.w / srcW) * 100}%`,
              height: `${(crop.h / srcH) * 100}%`,
          }
        : null

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
                            {/* Crop region overlay */}
                            {overlay && (
                                <div className="pointer-events-none absolute inset-0">
                                    <div
                                        className="absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                                        style={overlay}
                                    >
                                        <span className="absolute -top-6 left-0 text-[10px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                            {crop.w}×{crop.h}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
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

            {/* Right: Crop controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-6 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Crop className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectPrompt")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Source dimensions readout */}
                    <div className="flex items-center justify-between rounded-xl bg-secondary/20 border border-border/50 px-4 py-3">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            {t("sourceLabel")}
                        </Label>
                        <span className="font-mono font-bold text-primary">
                            {hasSource ? `${srcW} × ${srcH}` : "—"}
                        </span>
                    </div>

                    {/* Aspect ratio preset */}
                    <div className="space-y-2">
                        <Label className="text-base">{t("aspectLabel")}</Label>
                        <Select value={presetId} onValueChange={handlePresetChange}>
                            <SelectTrigger className="w-full h-11">
                                <SelectValue placeholder={t("aspectPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CUSTOM_VALUE}>{t("aspectCustom")}</SelectItem>
                                {ASPECT_PRESETS.map((preset) => (
                                    <SelectItem key={preset.id} value={preset.id}>
                                        {t(`aspect_${preset.id.replace(":", "_")}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t("aspectHint")}</p>
                    </div>

                    {/* Manual crop inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("widthLabel")}</Label>
                            <Input
                                type="number"
                                min={2}
                                value={crop.w || ""}
                                onChange={(e) => handleFieldChange("w", e.target.value)}
                                className="font-mono h-11"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("heightLabel")}</Label>
                            <Input
                                type="number"
                                min={2}
                                value={crop.h || ""}
                                onChange={(e) => handleFieldChange("h", e.target.value)}
                                className="font-mono h-11"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("xLabel")}</Label>
                            <Input
                                type="number"
                                min={0}
                                value={crop.x || ""}
                                onChange={(e) => handleFieldChange("x", e.target.value)}
                                className="font-mono h-11"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("yLabel")}</Label>
                            <Input
                                type="number"
                                min={0}
                                value={crop.y || ""}
                                onChange={(e) => handleFieldChange("y", e.target.value)}
                                className="font-mono h-11"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleCrop}
                            disabled={!videoFile || processing || !loaded || !hasSource}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Crop className="mr-2" />
                            )}
                            {t("cropAction")}
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
