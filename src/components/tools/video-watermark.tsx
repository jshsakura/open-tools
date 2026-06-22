"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { fetchFile } from "@ffmpeg/util"
import {
    Download,
    FileVideo,
    Image as ImageIcon,
    Loader2,
    Stamp,
    Type,
    Upload,
    X,
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"
import {
    WATERMARK_POSITIONS,
    buildWatermarkArgs,
    type WatermarkPosition,
} from "./video-watermark.utils"

type WatermarkType = "text" | "image"

const DEFAULT_TEXT = "© Sample"
const DEFAULT_FONT_SIZE = 48
const DEFAULT_COLOR = "#ffffff"
const TEXT_PADDING = 16

/**
 * Render watermark text to a transparent PNG blob via <canvas>.
 * Avoids any ffmpeg drawtext/font dependency: the rendered PNG is overlaid
 * like any other image watermark.
 */
async function renderTextToPng(
    text: string,
    fontSize: number,
    color: string,
): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas 2D context unavailable")

    const font = `bold ${fontSize}px Arial, sans-serif`
    ctx.font = font
    const metrics = ctx.measureText(text)
    const width = Math.max(1, Math.ceil(metrics.width) + TEXT_PADDING * 2)
    const height = Math.ceil(fontSize * 1.4) + TEXT_PADDING * 2

    canvas.width = width
    canvas.height = height

    // Re-set font after resize (resize clears the context state).
    ctx.font = font
    ctx.textBaseline = "middle"
    ctx.textAlign = "left"
    ctx.fillStyle = color
    ctx.fillText(text, TEXT_PADDING, height / 2)

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Failed to render text to PNG"))
        }, "image/png")
    })
}

export function VideoWatermark() {
    const t = useTranslations("VideoWatermark")
    const { ffmpeg, load, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [resultName, setResultName] = useState("")

    // Watermark config (immutable updates only).
    const [wmType, setWmType] = useState<WatermarkType>("text")
    const [text, setText] = useState(DEFAULT_TEXT)
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
    const [color, setColor] = useState(DEFAULT_COLOR)
    const [logoFile, setLogoFile] = useState<File | null>(null)

    const [position, setPosition] = useState<WatermarkPosition>("bottom-right")
    const [opacity, setOpacity] = useState(0.8)
    const [enableScale, setEnableScale] = useState(false)
    const [scale, setScale] = useState(0.3)
    const [margin, setMargin] = useState(10)

    const videoRef = useRef<HTMLVideoElement>(null)

    // Load ffmpeg on mount; revoke object URLs on cleanup.
    useEffect(() => {
        void load()
    }, [load])

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
    }, [previewUrl, resultUrl])

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setVideoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setResultUrl(null)
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        setResultUrl(null)
    }

    const clearVideo = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
    }

    const canProcess =
        !!videoFile &&
        loaded &&
        !processing &&
        (wmType === "text" ? text.trim().length > 0 : !!logoFile)

    const applyWatermark = async () => {
        if (!videoFile || !loaded) return
        const ff = ffmpeg.current
        if (!ff) return

        setProcessing(true)
        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }

        const videoName = "input." + (videoFile.name.split(".").pop() || "mp4")
        const wmName = "wm.png"
        const outputName = "watermarked.mp4"

        try {
            // Build the watermark PNG (image upload, or text rendered to PNG).
            let wmBlob: Blob
            if (wmType === "image") {
                if (!logoFile) {
                    toast.error(t("errors.noLogo"))
                    setProcessing(false)
                    return
                }
                wmBlob = logoFile
            } else {
                if (!text.trim()) {
                    toast.error(t("errors.noText"))
                    setProcessing(false)
                    return
                }
                wmBlob = await renderTextToPng(text, fontSize, color)
            }

            await ff.writeFile(videoName, await fetchFile(videoFile))
            await ff.writeFile(wmName, await fetchFile(wmBlob))

            const args = buildWatermarkArgs({
                videoName,
                wmName,
                outputName,
                position,
                opacity,
                scale: enableScale ? scale : 1,
                margin,
            })

            await ff.exec(args)

            const data = (await ff.readFile(outputName)) as Uint8Array
            const url = URL.createObjectURL(
                new Blob([data as BlobPart], { type: "video/mp4" }),
            )

            // Best-effort virtual FS cleanup.
            try {
                await ff.deleteFile(videoName)
                await ff.deleteFile(wmName)
                await ff.deleteFile(outputName)
            } catch {
                // ignore
            }

            setResultUrl(url)
            setResultName(outputName)
            toast.success(t("success"))
        } catch (error) {
            console.error("Watermark error:", error)
            toast.error(t("errors.failed"))
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: video preview / upload + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    {(!loaded || loading) && (
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
                                onChange={handleVideoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("uploadVideo")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        MP4, WebM, MOV
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
                                src={previewUrl!}
                                className="w-full h-full object-contain"
                                controls
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={clearVideo}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {resultUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <video
                            src={resultUrl}
                            controls
                            className="w-full rounded-lg bg-black"
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileVideo className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {resultName}
                                </p>
                            </div>
                            <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
                                <a href={resultUrl} download={resultName}>
                                    <Download className="mr-2 h-5 w-5" />
                                    {t("download")}
                                </a>
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Right: watermark controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 space-y-6 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Stamp className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectFirst")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Type toggle */}
                    <div className="space-y-3">
                        <Label className="text-base">{t("type.label")}</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["text", "image"] as WatermarkType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setWmType(type)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border-2 p-4 flex items-center justify-center gap-2 transition-all",
                                        wmType === type
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                    )}
                                >
                                    {type === "text" ? (
                                        <Type className="w-4 h-4" />
                                    ) : (
                                        <ImageIcon className="w-4 h-4" />
                                    )}
                                    <span className="font-semibold">{t(`type.${type}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text config */}
                    {wmType === "text" ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("text.label")}</Label>
                                <Input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={t("text.placeholder")}
                                    className="h-11"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>{t("text.fontSize")}</Label>
                                        <span className="font-mono text-sm text-primary">
                                            {fontSize}px
                                        </span>
                                    </div>
                                    <Slider
                                        value={[fontSize]}
                                        onValueChange={([v]) => setFontSize(v)}
                                        min={12}
                                        max={120}
                                        step={1}
                                        className="py-3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("text.color")}</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="h-11 w-14 rounded-lg border border-border bg-transparent cursor-pointer"
                                            aria-label={t("text.color")}
                                        />
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="h-11 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>{t("image.label")}</Label>
                            <div className="relative rounded-xl border-2 border-dashed border-muted-foreground/25 bg-secondary/30 hover:bg-secondary/50 transition-all p-6 text-center cursor-pointer">
                                <Input
                                    type="file"
                                    accept="image/png,image/webp,image/*"
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <ImageIcon className="w-8 h-8 mx-auto text-primary mb-2" />
                                <p className="text-sm font-medium">
                                    {logoFile ? logoFile.name : t("image.placeholder")}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("image.hint")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Position grid */}
                    <div className="space-y-3">
                        <Label className="text-base">{t("position.label")}</Label>
                        <div className="grid grid-cols-3 gap-2 max-w-[220px]">
                            {WATERMARK_POSITIONS.map((pos) => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setPosition(pos)}
                                    title={t(`position.${pos}`)}
                                    aria-label={t(`position.${pos}`)}
                                    className={cn(
                                        "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                                        position === pos
                                            ? "border-primary bg-primary/10"
                                            : "border-muted hover:border-primary/50",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            position === pos ? "bg-primary" : "bg-muted-foreground/40",
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>{t("opacity.label")}</Label>
                            <span className="font-mono text-sm text-primary">
                                {Math.round(opacity * 100)}%
                            </span>
                        </div>
                        <Slider
                            value={[opacity]}
                            onValueChange={([v]) => setOpacity(v)}
                            min={0.1}
                            max={1}
                            step={0.05}
                            className="py-3"
                        />
                    </div>

                    {/* Margin */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>{t("margin.label")}</Label>
                            <span className="font-mono text-sm text-primary">{margin}px</span>
                        </div>
                        <Slider
                            value={[margin]}
                            onValueChange={([v]) => setMargin(v)}
                            min={0}
                            max={100}
                            step={1}
                            className="py-3"
                        />
                    </div>

                    {/* Scale */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>{t("scale.label")}</Label>
                            <Switch checked={enableScale} onCheckedChange={setEnableScale} />
                        </div>
                        {enableScale && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {t("scale.hint")}
                                    </span>
                                    <span className="font-mono text-sm text-primary">
                                        {Math.round(scale * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[scale]}
                                    onValueChange={([v]) => setScale(v)}
                                    min={0.05}
                                    max={1}
                                    step={0.05}
                                    className="py-3"
                                />
                            </div>
                        )}
                    </div>

                    {/* Output format note (always MP4) */}
                    <div className="space-y-2">
                        <Label>{t("output.label")}</Label>
                        <Select value="mp4" disabled>
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                        onClick={applyWatermark}
                        disabled={!canProcess}
                    >
                        {processing ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            <Stamp className="mr-2" />
                        )}
                        {t("action")}
                    </Button>

                    {processing && (
                        <div className="space-y-2">
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
                </GlassCard>
            </div>
        </div>
    )
}
