"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Download,
    Trash2,
    Lock,
    Unlock,
    ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Preset {
    label: string
    width: number
    height: number
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function ImageResizerTool() {
    const t = useTranslations("ImageResizer")

    const [file, setFile] = useState<File | null>(null)
    const [originalUrl, setOriginalUrl] = useState<string | null>(null)
    const [originalWidth, setOriginalWidth] = useState(0)
    const [originalHeight, setOriginalHeight] = useState(0)
    const [targetWidth, setTargetWidth] = useState(0)
    const [targetHeight, setTargetHeight] = useState(0)
    const [lockAspect, setLockAspect] = useState(true)
    const [aspectRatio, setAspectRatio] = useState(1)
    const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("jpeg")
    const [quality, setQuality] = useState(0.9)
    const [resizedUrl, setResizedUrl] = useState<string | null>(null)
    const [resizedSize, setResizedSize] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const presets: Preset[] = [
        { label: t("presetInstagramPost"), width: 1080, height: 1080 },
        { label: t("presetInstagramStory"), width: 1080, height: 1920 },
        { label: t("presetFacebookCover"), width: 820, height: 312 },
        { label: t("presetTwitterHeader"), width: 1500, height: 500 },
        { label: t("presetYoutubeThumbnail"), width: 1280, height: 720 },
    ]

    const handleFile = useCallback(async (f: File) => {
        setFile(f)
        setResizedUrl(null)
        setResizedSize(0)

        const url = URL.createObjectURL(f)
        setOriginalUrl(url)

        const img = new Image()
        img.src = url
        await new Promise<void>((resolve) => { img.onload = () => resolve() })

        setOriginalWidth(img.naturalWidth)
        setOriginalHeight(img.naturalHeight)
        setTargetWidth(img.naturalWidth)
        setTargetHeight(img.naturalHeight)
        setAspectRatio(img.naturalWidth / img.naturalHeight)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith("image/")) handleFile(f)
    }, [handleFile])

    const handleWidthChange = useCallback((w: number) => {
        setTargetWidth(w)
        if (lockAspect && aspectRatio > 0) {
            setTargetHeight(Math.round(w / aspectRatio))
        }
        setResizedUrl(null)
    }, [lockAspect, aspectRatio])

    const handleHeightChange = useCallback((h: number) => {
        setTargetHeight(h)
        if (lockAspect && aspectRatio > 0) {
            setTargetWidth(Math.round(h * aspectRatio))
        }
        setResizedUrl(null)
    }, [lockAspect, aspectRatio])

    const applyPreset = useCallback((preset: Preset) => {
        setTargetWidth(preset.width)
        setTargetHeight(preset.height)
        setLockAspect(false)
        setResizedUrl(null)
    }, [])

    const handleResize = useCallback(async () => {
        if (!originalUrl || targetWidth <= 0 || targetHeight <= 0) return
        setIsProcessing(true)

        const img = new Image()
        img.src = originalUrl
        await new Promise<void>((resolve) => { img.onload = () => resolve() })

        const canvas = document.createElement("canvas")
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) { setIsProcessing(false); return }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        const mimeType = `image/${outputFormat}`
        const q = outputFormat === "png" ? undefined : quality

        canvas.toBlob((blob) => {
            if (blob) {
                setResizedUrl(URL.createObjectURL(blob))
                setResizedSize(blob.size)
                toast.success(t("resizeSuccess"))
            }
            setIsProcessing(false)
        }, mimeType, q)
    }, [originalUrl, targetWidth, targetHeight, outputFormat, quality, t])

    const handleDownload = useCallback(() => {
        if (!resizedUrl || !file) return
        const a = document.createElement("a")
        a.href = resizedUrl
        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat
        a.download = `${file.name.replace(/\.[^.]+$/, "")}_${targetWidth}x${targetHeight}.${ext}`
        a.click()
        toast.success(t("downloaded"))
    }, [resizedUrl, file, outputFormat, targetWidth, targetHeight, t])

    const handleReset = useCallback(() => {
        setFile(null)
        setOriginalUrl(null)
        setResizedUrl(null)
        setResizedSize(0)
        setTargetWidth(0)
        setTargetHeight(0)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [])

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!file && (
                <GlassCard
                    className="p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{t("dropTitle")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("dropDesc")}</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFile(f)
                        }}
                    />
                </GlassCard>
            )}

            {file && (
                <>
                    {/* Presets */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">{t("presets")}</h3>
                            <Button variant="ghost" size="sm" onClick={handleReset}>
                                <Trash2 className="h-4 w-4 mr-1" /> {t("reset")}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((p, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyPreset(p)}
                                    className={cn(
                                        "text-xs",
                                        targetWidth === p.width && targetHeight === p.height && "border-primary bg-primary/10"
                                    )}
                                >
                                    {p.label} ({p.width}x{p.height})
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setTargetWidth(originalWidth)
                                    setTargetHeight(originalHeight)
                                    setLockAspect(true)
                                    setAspectRatio(originalWidth / originalHeight)
                                    setResizedUrl(null)
                                }}
                                className="text-xs"
                            >
                                {t("presetCustom")}
                            </Button>
                        </div>
                    </GlassCard>

                    {/* Settings */}
                    <GlassCard className="p-4">
                        <h3 className="font-semibold text-sm mb-4">{t("settings")}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Dimensions */}
                            <div className="space-y-3">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label className="text-xs">{t("width")}</Label>
                                        <Input
                                            type="number"
                                            value={targetWidth}
                                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                                            min={1}
                                            max={10000}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 mb-0.5"
                                        onClick={() => {
                                            setLockAspect(!lockAspect)
                                            if (!lockAspect) setAspectRatio(targetWidth / targetHeight)
                                        }}
                                        title={lockAspect ? t("unlockAspect") : t("lockAspect")}
                                    >
                                        {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                    </Button>
                                    <div className="flex-1">
                                        <Label className="text-xs">{t("height")}</Label>
                                        <Input
                                            type="number"
                                            value={targetHeight}
                                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                                            min={1}
                                            max={10000}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("originalSize")}: {originalWidth} x {originalHeight} px
                                </p>
                            </div>

                            {/* Format & Quality */}
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs">{t("outputFormat")}</Label>
                                    <div className="flex gap-2 mt-1">
                                        {(["png", "jpeg", "webp"] as const).map((fmt) => (
                                            <Button
                                                key={fmt}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setOutputFormat(fmt); setResizedUrl(null) }}
                                                className={cn(
                                                    "text-xs flex-1",
                                                    outputFormat === fmt && "border-primary bg-primary/10"
                                                )}
                                            >
                                                {fmt.toUpperCase()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                {outputFormat !== "png" && (
                                    <div>
                                        <Label className="text-xs">{t("quality")}: {Math.round(quality * 100)}%</Label>
                                        <Slider
                                            value={[quality]}
                                            onValueChange={([v]) => { setQuality(v); setResizedUrl(null) }}
                                            min={0.1}
                                            max={1}
                                            step={0.05}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            <Button onClick={handleResize} disabled={isProcessing} className="gap-2">
                                <ArrowRight className="h-4 w-4" />
                                {isProcessing ? t("processing") : t("resizeButton")}
                            </Button>
                        </div>
                    </GlassCard>

                    {/* Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GlassCard className="p-4">
                            <h3 className="font-semibold text-sm mb-3">{t("original")}</h3>
                            {originalUrl && (
                                <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={originalUrl} alt="Original" className="max-w-full max-h-[300px] object-contain" />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground text-center mt-2">
                                {originalWidth} x {originalHeight} px &middot; {file ? formatBytes(file.size) : ""}
                            </p>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <h3 className="font-semibold text-sm mb-3">{t("resized")}</h3>
                            {resizedUrl ? (
                                <>
                                    <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={resizedUrl} alt="Resized" className="max-w-full max-h-[300px] object-contain" />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        {targetWidth} x {targetHeight} px &middot; {formatBytes(resizedSize)}
                                    </p>
                                    <div className="flex justify-center mt-3">
                                        <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" /> {t("download")}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground">{t("previewPlaceholder")}</p>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </>
            )}
        </div>
    )
}
