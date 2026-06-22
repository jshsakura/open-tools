"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { fetchFile } from "@ffmpeg/util"
import {
    Upload,
    Download,
    Trash2,
    ArrowUp,
    ArrowDown,
    Loader2,
    Film,
    Clapperboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildConcatList, buildSlideshowArgs } from "./images-to-video.utils"
import { toast } from "sonner"

interface SlideImage {
    id: string
    file: File
    url: string
}

// Output resolution presets (W x H). Images are letterboxed to fit.
const RESOLUTIONS: Record<string, { width: number; height: number }> = {
    "1280x720": { width: 1280, height: 720 },
    "1920x1080": { width: 1920, height: 1080 },
    "1080x1080": { width: 1080, height: 1080 },
    "720x1280": { width: 720, height: 1280 },
}

const FPS_OPTIONS = ["24", "30", "60"]

const MIN_DURATION = 0.5
const MAX_DURATION = 10
const DURATION_STEP = 0.5

function padIndex(i: number): string {
    return i.toString().padStart(3, "0")
}

export function ImagesToVideo() {
    const t = useTranslations("ImagesToVideo")
    const { ffmpeg, load, loaded, loading, progress } = useFfmpeg()

    const [images, setImages] = useState<SlideImage[]>([])
    const [durationSec, setDurationSec] = useState(2)
    const [fps, setFps] = useState("30")
    const [resolution, setResolution] = useState("1280x720")
    const [processing, setProcessing] = useState(false)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Keep latest result url for cleanup without re-running the mount effect.
    const resultUrlRef = useRef<string | null>(null)
    useEffect(() => {
        resultUrlRef.current = resultUrl
    }, [resultUrl])

    useEffect(() => {
        load()
        return () => {
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
        }
        // load is stable (useCallback); run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const addFiles = useCallback(
        (fileList: FileList | File[]) => {
            const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"))
            if (files.length === 0) {
                toast.error(t("errorNoImage"))
                return
            }
            const next = files.map((file) => ({
                id: crypto.randomUUID(),
                file,
                url: URL.createObjectURL(file),
            }))
            setImages((prev) => [...prev, ...next])
        },
        [t],
    )

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
    }

    const move = (index: number, dir: -1 | 1) => {
        setImages((prev) => {
            const target = index + dir
            if (target < 0 || target >= prev.length) return prev
            const next = [...prev]
            const tmp = next[index]
            next[index] = next[target]
            next[target] = tmp
            return next
        })
    }

    const remove = (id: string) => {
        setImages((prev) => {
            const found = prev.find((img) => img.id === id)
            if (found) URL.revokeObjectURL(found.url)
            return prev.filter((img) => img.id !== id)
        })
    }

    const clearAll = () => {
        setImages((prev) => {
            prev.forEach((img) => URL.revokeObjectURL(img.url))
            return []
        })
    }

    const generate = async () => {
        if (images.length === 0 || !loaded) return
        const ff = ffmpeg.current
        if (!ff) {
            toast.error(t("errorFfmpeg"))
            return
        }

        setProcessing(true)
        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }

        const imageNames: string[] = []
        const listName = "list.txt"
        const outputName = "out.mp4"

        try {
            // Write each image to the virtual FS with a stable, ordered name.
            for (let i = 0; i < images.length; i++) {
                const name = `img${padIndex(i)}.png`
                imageNames.push(name)
                await ff.writeFile(name, await fetchFile(images[i].file))
            }

            const list = buildConcatList(imageNames, durationSec)
            await ff.writeFile(listName, new TextEncoder().encode(list))

            const { width, height } = RESOLUTIONS[resolution] ?? RESOLUTIONS["1280x720"]
            const args = buildSlideshowArgs({
                listName,
                outputName,
                width,
                height,
                fps: Number(fps),
            })

            await ff.exec(args)

            const data = (await ff.readFile(outputName)) as Uint8Array
            const url = URL.createObjectURL(new Blob([data as BlobPart], { type: "video/mp4" }))
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Slideshow generation failed:", err)
            toast.error(t("errorGenerate"))
        } finally {
            // Best-effort cleanup of the virtual FS.
            for (const name of [...imageNames, listName, outputName]) {
                try {
                    await ff.deleteFile(name)
                } catch {
                    // ignore
                }
            }
            setProcessing(false)
        }
    }

    const isBusy = loading || processing

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-4">
                    {/* Dropzone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
                            isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/25 bg-secondary/40 hover:bg-secondary/60"
                        }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-lg font-bold">{t("dropTitle")}</p>
                        <p className="text-sm text-muted-foreground">{t("dropHint")}</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addFiles(e.target.files)
                                e.target.value = ""
                            }}
                        />
                    </div>

                    {/* Ordered thumbnails */}
                    {images.length > 0 && (
                        <GlassCard className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold">
                                    {t("imagesCount", { count: images.length })}
                                </h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={clearAll}
                                    className="gap-1 text-destructive"
                                >
                                    <Trash2 className="w-3 h-3" /> {t("clearAll")}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {images.map((img, i) => (
                                    <div
                                        key={img.id}
                                        className="group relative rounded-lg overflow-hidden border border-border/40 bg-black/20"
                                    >
                                        <div className="w-full aspect-video flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img.url}
                                                alt={`frame ${i + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            {i + 1}
                                        </span>
                                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => move(i, -1)}
                                                disabled={i === 0}
                                                className="p-1 rounded hover:bg-white/20 disabled:opacity-30"
                                                aria-label={t("moveUp")}
                                            >
                                                <ArrowUp className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={() => move(i, 1)}
                                                disabled={i === images.length - 1}
                                                className="p-1 rounded hover:bg-white/20 disabled:opacity-30"
                                                aria-label={t("moveDown")}
                                            >
                                                <ArrowDown className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={() => remove(img.id)}
                                                className="p-1 rounded hover:bg-white/20"
                                                aria-label={t("remove")}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Result */}
                    {resultUrl && (
                        <GlassCard className="p-4 space-y-4 border-primary/20">
                            <h3 className="font-bold flex items-center gap-2">
                                <Film className="w-4 h-4 text-primary" />
                                {t("resultTitle")}
                            </h3>
                            <video
                                src={resultUrl}
                                controls
                                className="w-full rounded-lg bg-black"
                            />
                            <Button asChild size="lg" className="w-full font-bold gap-2">
                                <a href={resultUrl} download="slideshow.mp4">
                                    <Download className="w-4 h-4" />
                                    {t("download")}
                                </a>
                            </Button>
                        </GlassCard>
                    )}
                </div>

                {/* Settings */}
                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6 sticky top-6 relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/80 backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm font-medium">{t("loading")}</p>
                            </div>
                        )}

                        <h3 className="font-bold flex items-center gap-2">
                            <Clapperboard className="w-4 h-4 text-primary" />
                            {t("settings")}
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="text-xs font-bold">{t("duration")}</Label>
                                <span className="font-mono font-bold text-primary text-sm">
                                    {durationSec}s
                                </span>
                            </div>
                            <Slider
                                value={[durationSec]}
                                min={MIN_DURATION}
                                max={MAX_DURATION}
                                step={DURATION_STEP}
                                onValueChange={([v]) => setDurationSec(v)}
                                className="py-2"
                            />
                            <p className="text-[11px] text-muted-foreground">{t("durationHint")}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("fps")}</Label>
                            <Select value={fps} onValueChange={setFps}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FPS_OPTIONS.map((f) => (
                                        <SelectItem key={f} value={f}>
                                            {t("fpsValue", { fps: f })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("resolution")}</Label>
                            <Select value={resolution} onValueChange={setResolution}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1280x720">{t("res720p")}</SelectItem>
                                    <SelectItem value="1920x1080">{t("res1080p")}</SelectItem>
                                    <SelectItem value="1080x1080">{t("resSquare")}</SelectItem>
                                    <SelectItem value="720x1280">{t("resVertical")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            size="lg"
                            className="w-full font-bold gap-2"
                            onClick={generate}
                            disabled={images.length === 0 || isBusy || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Film className="w-4 h-4" />
                            )}
                            {processing ? t("processing") : t("generate")}
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
        </div>
    )
}
