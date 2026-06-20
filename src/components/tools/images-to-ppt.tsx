"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Download,
    Trash2,
    ArrowUp,
    ArrowDown,
    Presentation,
    Loader2,
    Maximize,
    Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import { toast } from "sonner"

type SlideRatio = "16:9" | "4:3" | "auto"
type FillMode = "cover" | "contain"

interface Slide {
    id: string
    file: File
    dataUrl: string
    width: number
    height: number
}

// PPTX slide width is fixed at 10 inches; height derives from the ratio.
const SLIDE_WIDTH_IN = 10
const RATIO_HEIGHTS: Record<Exclude<SlideRatio, "auto">, number> = {
    "16:9": 5.625,
    "4:3": 7.5,
}
const AUTO_MIN_HEIGHT = 2
const AUTO_MAX_HEIGHT = 20

const readImage = (file: File): Promise<Slide> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error("read-failed"))
        reader.onload = () => {
            const dataUrl = reader.result as string
            const img = new Image()
            img.onerror = () => reject(new Error("decode-failed"))
            img.onload = () =>
                resolve({
                    id: crypto.randomUUID(),
                    file,
                    dataUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                })
            img.src = dataUrl
        }
        reader.readAsDataURL(file)
    })

export function ImagesToPpt() {
    const t = useTranslations("ImagesToPpt")

    const [slides, setSlides] = useState<Slide[]>([])
    const [ratio, setRatio] = useState<SlideRatio>("16:9")
    const [fillMode, setFillMode] = useState<FillMode>("cover")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [isDragging, setIsDragging] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const slideHeight =
        ratio === "auto"
            ? Math.min(
                  AUTO_MAX_HEIGHT,
                  Math.max(
                      AUTO_MIN_HEIGHT,
                      slides[0]
                          ? SLIDE_WIDTH_IN / (slides[0].width / slides[0].height)
                          : RATIO_HEIGHTS["16:9"]
                  )
              )
            : RATIO_HEIGHTS[ratio]
    const slideAspect = SLIDE_WIDTH_IN / slideHeight

    const addFiles = useCallback(async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"))
        if (files.length === 0) {
            toast.error(t("errorNoImage"))
            return
        }
        try {
            const loaded = await Promise.all(files.map(readImage))
            setSlides((prev) => [...prev, ...loaded])
        } catch {
            toast.error(t("errorLoad"))
        }
    }, [t])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
    }

    const move = (index: number, dir: -1 | 1) => {
        setSlides((prev) => {
            const next = [...prev]
            const target = index + dir
            if (target < 0 || target >= next.length) return prev
            ;[next[index], next[target]] = [next[target], next[index]]
            return next
        })
    }

    const remove = (id: string) => setSlides((prev) => prev.filter((s) => s.id !== id))
    const clearAll = () => setSlides([])

    const generate = async () => {
        if (slides.length === 0) return
        setIsGenerating(true)
        try {
            const PptxGenJS = (await import("pptxgenjs")).default
            const pptx = new PptxGenJS()
            pptx.defineLayout({ name: "CUSTOM", width: SLIDE_WIDTH_IN, height: slideHeight })
            pptx.layout = "CUSTOM"

            const bg = bgColor.replace("#", "").toUpperCase()

            for (const slide of slides) {
                const s = pptx.addSlide()
                s.background = { color: bg }

                if (fillMode === "cover") {
                    s.addImage({
                        data: slide.dataUrl,
                        x: 0,
                        y: 0,
                        w: SLIDE_WIDTH_IN,
                        h: slideHeight,
                        sizing: { type: "cover", w: SLIDE_WIDTH_IN, h: slideHeight },
                    })
                } else {
                    // Contain: maximize within the slide, preserve aspect, center.
                    const imgAspect = slide.width / slide.height
                    let w = SLIDE_WIDTH_IN
                    let h = SLIDE_WIDTH_IN / imgAspect
                    if (h > slideHeight) {
                        h = slideHeight
                        w = slideHeight * imgAspect
                    }
                    s.addImage({
                        data: slide.dataUrl,
                        x: (SLIDE_WIDTH_IN - w) / 2,
                        y: (slideHeight - h) / 2,
                        w,
                        h,
                    })
                }
            }

            await pptx.writeFile({ fileName: `slides_${slides.length}_${Date.now()}.pptx` })
            toast.success(t("generated", { count: slides.length }))
        } catch (err) {
            console.error("PPTX generation failed:", err)
            toast.error(t("errorGenerate"))
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
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

                    <div className="flex justify-center">
                        <ClipboardPasteButton onImageFile={(f) => addFiles([f])} />
                    </div>

                    {/* Slide list */}
                    {slides.length > 0 && (
                        <GlassCard className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold">
                                    {t("slides")} ({slides.length})
                                </h3>
                                <Button size="sm" variant="ghost" onClick={clearAll} className="gap-1 text-destructive">
                                    <Trash2 className="w-3 h-3" /> {t("clearAll")}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slides.map((slide, i) => (
                                    <div
                                        key={slide.id}
                                        className="group relative rounded-lg overflow-hidden border border-border/40 bg-secondary/30"
                                    >
                                        <div
                                            className="w-full flex items-center justify-center overflow-hidden"
                                            style={{ aspectRatio: slideAspect, backgroundColor: bgColor }}
                                        >
                                            <img
                                                src={slide.dataUrl}
                                                alt={`slide ${i + 1}`}
                                                className={`w-full h-full ${
                                                    fillMode === "cover" ? "object-cover" : "object-contain"
                                                }`}
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
                                                disabled={i === slides.length - 1}
                                                className="p-1 rounded hover:bg-white/20 disabled:opacity-30"
                                                aria-label={t("moveDown")}
                                            >
                                                <ArrowDown className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={() => remove(slide.id)}
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
                </div>

                {/* Settings */}
                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6 sticky top-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Presentation className="w-4 h-4 text-primary" />
                            {t("settings")}
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("slideSize")}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["16:9", "4:3", "auto"] as SlideRatio[]).map((r) => (
                                    <Button
                                        key={r}
                                        size="sm"
                                        variant={ratio === r ? "default" : "outline"}
                                        onClick={() => setRatio(r)}
                                        className="text-xs font-mono"
                                    >
                                        {r === "auto" ? t("ratioAuto") : r}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("fillMode")}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant={fillMode === "cover" ? "default" : "outline"}
                                    onClick={() => setFillMode("cover")}
                                    className="gap-1 text-xs"
                                >
                                    <Maximize className="w-3 h-3" /> {t("fillCover")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant={fillMode === "contain" ? "default" : "outline"}
                                    onClick={() => setFillMode("contain")}
                                    className="gap-1 text-xs"
                                >
                                    <ImageIcon className="w-3 h-3" /> {t("fillContain")}
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {fillMode === "cover" ? t("fillCoverHint") : t("fillContainHint")}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("bgColor")}</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-border/30 cursor-pointer"
                                />
                                <Input
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full font-bold gap-2"
                            onClick={generate}
                            disabled={slides.length === 0 || isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isGenerating ? t("generating") : t("generate")}
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
