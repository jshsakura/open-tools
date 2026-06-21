"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Trash2, Eye, Columns2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import {
    CVD_MATRICES,
    CVD_TYPES,
    applyMatrix,
    type CvdType,
} from "./color-blindness-simulator.utils"

const MAX_PREVIEW_HEIGHT = 500
type ViewMode = "compare" | "single"

/** Returns a new ImageData with the CVD matrix applied. Pure over the source. */
function simulate(source: ImageData, type: CvdType): ImageData {
    const matrix = CVD_MATRICES[type]
    const out = new ImageData(
        new Uint8ClampedArray(source.data),
        source.width,
        source.height,
    )
    const data = out.data
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = applyMatrix(data[i], data[i + 1], data[i + 2], matrix)
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
    }
    return out
}

export function ColorBlindnessSimulator() {
    const t = useTranslations("ColorBlindnessSimulator")

    const originalCanvasRef = useRef<HTMLCanvasElement>(null)
    const simulatedCanvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("")
    const [cvdType, setCvdType] = useState<CvdType>("protanopia")
    const [viewMode, setViewMode] = useState<ViewMode>("compare")

    const drawCanvases = useCallback(() => {
        const image_ = image
        if (!image_) return
        const container = containerRef.current
        if (!container) return

        const maxW = container.clientWidth
        const scale = Math.min(maxW / image_.width, MAX_PREVIEW_HEIGHT / image_.height, 1)
        const width = Math.max(1, Math.round(image_.width * scale))
        const height = Math.max(1, Math.round(image_.height * scale))

        const original = originalCanvasRef.current
        const simulated = simulatedCanvasRef.current
        const octx = original?.getContext("2d")
        const sctx = simulated?.getContext("2d", { willReadFrequently: true })
        if (!original || !simulated || !octx || !sctx) return

        for (const canvas of [original, simulated]) {
            canvas.width = width
            canvas.height = height
        }

        octx.drawImage(image_, 0, 0, width, height)
        sctx.drawImage(image_, 0, 0, width, height)
        const source = sctx.getImageData(0, 0, width, height)
        sctx.putImageData(simulate(source, cvdType), 0, 0)
    }, [image, cvdType])

    useEffect(() => {
        drawCanvases()
    }, [drawCanvases])

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) {
                toast.error(t("errorInvalid"))
                return
            }
            setFileName(file.name)
            const img = new Image()
            img.onload = () => setImage(img)
            img.onerror = () => toast.error(t("errorInvalid"))
            img.src = URL.createObjectURL(file)
        },
        [t],
    )

    const exportImage = () => {
        const image_ = image
        if (!image_) return
        const c = document.createElement("canvas")
        c.width = image_.width
        c.height = image_.height
        const ctx = c.getContext("2d", { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(image_, 0, 0)
        const source = ctx.getImageData(0, 0, c.width, c.height)
        ctx.putImageData(simulate(source, cvdType), 0, 0)

        const baseName = fileName.replace(/\.[^.]+$/, "") || "image"
        c.toBlob((blob) => {
            if (!blob) return
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `${cvdType}_${baseName}.png`
            a.click()
            URL.revokeObjectURL(a.href)
            toast.success(t("downloaded"))
        }, "image/png")
    }

    const clear = () => {
        setImage(null)
        setFileName("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

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
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault()
                        const f = e.dataTransfer.files?.[0]
                        if (f) handleFile(f)
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFile(f)
                        }}
                    />
                    <div className="bg-primary/10 p-6 rounded-full mb-6 animate-pulse">
                        <Upload className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t("dropTitle")}</h3>
                    <p className="text-muted-foreground mb-6">{t("dropDesc")}</p>
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            {t("selectFile")}
                        </Button>
                        <ClipboardPasteButton onImageFile={handleFile} size="default" />
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-6">
                    <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-xs font-bold">{t("typeLabel")}</Label>
                            <Select
                                value={cvdType}
                                onValueChange={(value: CvdType) => setCvdType(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CVD_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {t(`types.${type}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setViewMode((m) => (m === "compare" ? "single" : "compare"))
                                }
                                className="gap-1.5"
                            >
                                {viewMode === "compare" ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <Columns2 className="w-4 h-4" />
                                )}
                                {viewMode === "compare" ? t("viewSingle") : t("viewCompare")}
                            </Button>
                            <Button variant="default" size="sm" onClick={exportImage} className="gap-1.5">
                                <Download className="w-4 h-4" />
                                {t("download")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clear}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                aria-label={t("clear")}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </GlassCard>

                    <div ref={containerRef}>
                        <div
                            className={cn(
                                "grid gap-4",
                                viewMode === "compare" ? "md:grid-cols-2" : "grid-cols-1",
                            )}
                        >
                            <GlassCard
                                className={cn(
                                    "p-3 space-y-2",
                                    viewMode === "single" && "hidden",
                                )}
                            >
                                <p className="text-xs font-bold text-muted-foreground text-center">
                                    {t("originalLabel")}
                                </p>
                                <canvas ref={originalCanvasRef} className="w-full rounded-lg" />
                            </GlassCard>

                            <GlassCard
                                className={cn(
                                    "p-3 space-y-2",
                                    viewMode === "single" && "md:col-span-2",
                                )}
                            >
                                <p className="text-xs font-bold text-primary text-center">
                                    {t(`types.${cvdType}`)}
                                </p>
                                <canvas ref={simulatedCanvasRef} className="w-full rounded-lg" />
                            </GlassCard>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
