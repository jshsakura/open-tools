"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Trash2, SlidersHorizontal, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"

type OutputFormat = "png" | "jpeg" | "webp"
const OUTPUT_FORMATS: OutputFormat[] = ["png", "jpeg", "webp"]
const DEFAULT_QUALITY = 0.92

interface FilterState {
    brightness: number
    contrast: number
    saturate: number
    blur: number
    grayscale: number
    sepia: number
    hueRotate: number
    invert: number
}

const DEFAULT_FILTERS: FilterState = {
    brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0,
}

const PRESETS: { name: string; filters: FilterState }[] = [
    { name: "Original", filters: { ...DEFAULT_FILTERS } },
    { name: "Vintage", filters: { ...DEFAULT_FILTERS, sepia: 60, contrast: 110, brightness: 95, saturate: 80 } },
    { name: "B&W", filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 120 } },
    { name: "Warm", filters: { ...DEFAULT_FILTERS, sepia: 20, saturate: 130, brightness: 105 } },
    { name: "Cool", filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturate: 80, brightness: 105 } },
    { name: "Dramatic", filters: { ...DEFAULT_FILTERS, contrast: 150, brightness: 90, saturate: 130 } },
    { name: "Fade", filters: { ...DEFAULT_FILTERS, brightness: 110, contrast: 90, saturate: 80 } },
    { name: "Vivid", filters: { ...DEFAULT_FILTERS, saturate: 180, contrast: 115 } },
]

export function ImageFilters() {
    const t = useTranslations("ImageFilters")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("")
    const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS })
    const [activePreset, setActivePreset] = useState("Original")
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("png")
    const [quality, setQuality] = useState(DEFAULT_QUALITY)

    const getFilterString = useCallback((f: FilterState) => {
        return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg) invert(${f.invert}%)`
    }, [])

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !image) return

        const container = containerRef.current
        if (!container) return
        const maxW = container.clientWidth
        const maxH = 500
        const scale = Math.min(maxW / image.width, maxH / image.height, 1)

        canvas.width = image.width * scale
        canvas.height = image.height * scale

        ctx.filter = getFilterString(filters)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        ctx.filter = "none"
    }, [image, filters, getFilterString])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        setFileName(file.name)
        const img = new Image()
        img.onload = () => {
            setImage(img)
            setFilters({ ...DEFAULT_FILTERS })
            setActivePreset("Original")
        }
        img.src = URL.createObjectURL(file)
    }

    const exportImage = () => {
        if (!image) return
        const c = document.createElement("canvas")
        c.width = image.width
        c.height = image.height
        const ctx = c.getContext("2d")!
        ctx.filter = getFilterString(filters)
        ctx.drawImage(image, 0, 0)
        ctx.filter = "none"

        const ext = outputFormat === "jpeg" ? "jpg" : outputFormat
        const baseName = fileName.replace(/\.[^.]+$/, "") || "image"
        const q = outputFormat === "png" ? undefined : quality

        c.toBlob((blob) => {
            if (!blob) return
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `filtered_${baseName}.${ext}`
            a.click()
            toast.success(t("downloaded"))
        }, `image/${outputFormat}`, q)
    }

    const applyPreset = (preset: typeof PRESETS[number]) => {
        setFilters({ ...preset.filters })
        setActivePreset(preset.name)
    }

    const updateFilter = (key: keyof FilterState, value: number) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setActivePreset("")
    }

    const clear = () => {
        setImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const FILTER_CONTROLS: { key: keyof FilterState; min: number; max: number; step: number; unit: string }[] = [
        { key: "brightness", min: 0, max: 200, step: 1, unit: "%" },
        { key: "contrast", min: 0, max: 200, step: 1, unit: "%" },
        { key: "saturate", min: 0, max: 300, step: 1, unit: "%" },
        { key: "blur", min: 0, max: 20, step: 0.5, unit: "px" },
        { key: "grayscale", min: 0, max: 100, step: 1, unit: "%" },
        { key: "sepia", min: 0, max: 100, step: 1, unit: "%" },
        { key: "hueRotate", min: 0, max: 360, step: 1, unit: "°" },
        { key: "invert", min: 0, max: 100, step: 1, unit: "%" },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            {!image ? (
                <GlassCard
                    className="h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
                >
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                    <div className="bg-primary/10 p-6 rounded-full mb-6 animate-pulse">
                        <Upload className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t("dropTitle")}</h3>
                    <p className="text-muted-foreground mb-6">{t("dropDesc")}</p>
                    <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>{t("selectFile")}</Button>
                        <ClipboardPasteButton onImageFile={handleFile} size="default" />
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-6">
                    {/* Presets */}
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-sm font-bold">{t("presets")}</h3>
                            <Button variant="ghost" size="sm" onClick={() => applyPreset(PRESETS[0])} className="h-7 text-xs gap-1">
                                <RotateCcw className="w-3 h-3" /> {t("reset")}
                            </Button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                    className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activePreset === preset.name ? "border-primary ring-2 ring-primary/20" : "border-border/30 hover:border-primary/50"}`}
                                >
                                    <div className="w-20 h-14 overflow-hidden">
                                        <img src={image.src} alt={preset.name} className="w-full h-full object-cover" style={{ filter: getFilterString(preset.filters) }} />
                                    </div>
                                    <div className="text-[10px] font-bold py-1 text-center">{preset.name}</div>
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                        <GlassCard className="p-4">
                            <div ref={containerRef}>
                                <canvas ref={canvasRef} className="w-full rounded-lg" />
                            </div>
                        </GlassCard>

                        <div className="space-y-6">
                            <GlassCard className="p-6 space-y-5 sticky top-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                                        {t("adjustments")}
                                    </h3>
                                    <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {FILTER_CONTROLS.map(({ key, min, max, step, unit }) => (
                                    <div key={key} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <Label className="font-bold capitalize">{t(key)}</Label>
                                            <span className="font-mono text-primary">{filters[key]}{unit}</span>
                                        </div>
                                        <Slider value={[filters[key]]} onValueChange={([v]) => updateFilter(key, v)} min={min} max={max} step={step} />
                                    </div>
                                ))}

                                <div className="space-y-3 pt-1 border-t border-border/30">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold">{t("outputFormat")}</Label>
                                        <div className="flex gap-2">
                                            {OUTPUT_FORMATS.map((fmt) => (
                                                <Button
                                                    key={fmt}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setOutputFormat(fmt)}
                                                    className={cn(
                                                        "flex-1 text-xs",
                                                        outputFormat === fmt && "border-primary bg-primary/10"
                                                    )}
                                                >
                                                    {fmt.toUpperCase()}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    {outputFormat !== "png" && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <Label className="font-bold">{t("quality")}</Label>
                                                <span className="font-mono text-primary">{Math.round(quality * 100)}%</span>
                                            </div>
                                            <Slider
                                                value={[quality]}
                                                onValueChange={([v]) => setQuality(v)}
                                                min={0.1}
                                                max={1}
                                                step={0.05}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Button size="lg" className="w-full font-bold gap-2" onClick={exportImage}>
                                    <Download className="w-4 h-4" />
                                    {t("download")}
                                </Button>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
