"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Download, Plus, Trash2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import { toast } from "sonner"
import { computeCells, computeCanvasSize, ASPECT_RATIOS, type Cell } from "./collage-maker.utils"

type LayoutType =
    | "2x1" | "1x2" | "2x2" | "3x1" | "1x3" | "3x3"
    | "4x1" | "1x4" | "2x3" | "3x2"

const LAYOUTS: { value: LayoutType; cols: number; rows: number; label: string }[] = [
    { value: "2x1", cols: 2, rows: 1, label: "2×1" },
    { value: "1x2", cols: 1, rows: 2, label: "1×2" },
    { value: "2x2", cols: 2, rows: 2, label: "2×2" },
    { value: "3x1", cols: 3, rows: 1, label: "3×1" },
    { value: "1x3", cols: 1, rows: 3, label: "1×3" },
    { value: "3x3", cols: 3, rows: 3, label: "3×3" },
    { value: "4x1", cols: 4, rows: 1, label: "4×1" },
    { value: "1x4", cols: 1, rows: 4, label: "1×4" },
    { value: "2x3", cols: 2, rows: 3, label: "2×3" },
    { value: "3x2", cols: 3, rows: 2, label: "3×2" },
]

const PREVIEW_MAX = 800

interface ImageSlot {
    id: string
    image: HTMLImageElement
    file: File
}

/** Trace a rounded-rectangle path on the context (does not fill or stroke). */
function roundedRectPath(ctx: CanvasRenderingContext2D, cell: Cell, r: number) {
    const { x, y, w, h } = cell
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

/** Draw an image into a cell using cover-fit (center crop). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cell: Cell) {
    const { x, y, w, h } = cell
    const imgRatio = img.width / img.height
    const cellRatio = w / h
    let sx = 0, sy = 0, sw = img.width, sh = img.height
    if (imgRatio > cellRatio) {
        sw = img.height * cellRatio
        sx = (img.width - sw) / 2
    } else {
        sh = img.width / cellRatio
        sy = (img.height - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export function CollageMaker() {
    const t = useTranslations("CollageMaker")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [images, setImages] = useState<ImageSlot[]>([])
    const [layout, setLayout] = useState<LayoutType>("2x2")
    const [aspect, setAspect] = useState("1:1")
    const [gap, setGap] = useState(8)
    const [bgColor, setBgColor] = useState("#ffffff")
    const [borderRadius, setBorderRadius] = useState(0)
    const [outputSize, setOutputSize] = useState(1200)

    const currentLayout = LAYOUTS.find(l => l.value === layout)!
    const currentAspect = ASPECT_RATIOS.find(a => a.value === aspect)!
    const totalSlots = currentLayout.cols * currentLayout.rows

    /** Render the collage onto a context sized to `width` x `height`. */
    const renderTo = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number, withPlaceholders: boolean) => {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, width, height)

            const cells = computeCells(width, height, currentLayout.cols, currentLayout.rows, gap * scale)
            const r = borderRadius * scale

            cells.forEach((cell, idx) => {
                ctx.save()
                roundedRectPath(ctx, cell, r)
                ctx.clip()

                if (images[idx]) {
                    drawCover(ctx, images[idx].image, cell)
                } else if (withPlaceholders) {
                    ctx.fillStyle = "rgba(128,128,128,0.1)"
                    ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
                    ctx.strokeStyle = "rgba(128,128,128,0.3)"
                    ctx.setLineDash([6, 4])
                    ctx.strokeRect(cell.x + 1, cell.y + 1, cell.w - 2, cell.h - 2)
                    ctx.setLineDash([])
                    ctx.fillStyle = "rgba(128,128,128,0.3)"
                    ctx.font = `bold ${24 * scale}px sans-serif`
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillText("+", cell.x + cell.w / 2, cell.y + cell.h / 2)
                }
                ctx.restore()
            })
        },
        [images, gap, bgColor, borderRadius, currentLayout],
    )

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const full = computeCanvasSize(outputSize, currentAspect.ratioW, currentAspect.ratioH)
        const scale = Math.min(PREVIEW_MAX / full.width, PREVIEW_MAX / full.height, 1)
        const dispW = Math.round(full.width * scale)
        const dispH = Math.round(full.height * scale)
        canvas.width = dispW
        canvas.height = dispH

        renderTo(ctx, dispW, dispH, scale, true)
    }, [outputSize, currentAspect, renderTo])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const loadFiles = (fileList: FileList | File[]) => {
        const files = Array.from(fileList)
        const newImages: ImageSlot[] = []
        let loaded = 0
        const toLoad = Math.min(files.length, totalSlots - images.length)
        if (toLoad <= 0) return

        for (let i = 0; i < toLoad; i++) {
            const file = files[i]
            if (!file.type.startsWith("image/")) continue
            const img = new Image()
            img.onload = () => {
                newImages.push({ id: crypto.randomUUID(), image: img, file })
                loaded++
                if (loaded === toLoad) {
                    setImages(prev => [...prev, ...newImages].slice(0, totalSlots))
                }
            }
            img.src = URL.createObjectURL(file)
        }
    }

    const handleFiles = (files: FileList) => loadFiles(files)

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx))
    }

    const exportCollage = () => {
        const { width, height } = computeCanvasSize(outputSize, currentAspect.ratioW, currentAspect.ratioH)
        const c = document.createElement("canvas")
        c.width = width
        c.height = height
        const ctx = c.getContext("2d")
        if (!ctx) return

        renderTo(ctx, width, height, 1, false)

        c.toBlob(blob => {
            if (!blob) return
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `collage_${Date.now()}.png`
            a.click()
            toast.success(t("downloaded"))
        }, "image/png")
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-center">
                            <canvas ref={canvasRef} className="max-w-full max-h-[70vh] rounded-lg" />
                        </div>
                    </GlassCard>

                    {/* Image slots */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold">{t("images")} ({images.length}/{totalSlots})</h3>
                            <div className="flex items-center gap-2">
                                <ClipboardPasteButton
                                    onImageFile={(f) => loadFiles([f])}
                                    enablePasteShortcut={images.length < totalSlots}
                                />
                                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={images.length >= totalSlots} className="gap-1">
                                    <Plus className="w-3 h-3" /> {t("addImage")}
                                </Button>
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={e => { if (e.target.files) handleFiles(e.target.files) }} />
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {images.map((slot, i) => (
                                <div key={slot.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border/30">
                                    <img src={slot.image.src} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                            {images.length < totalSlots && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-border/40 flex items-center justify-center hover:border-primary/50 transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6 sticky top-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-primary" />
                            {t("settings")}
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("layout")}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {LAYOUTS.map(l => (
                                    <Button key={l.value} size="sm" variant={layout === l.value ? "default" : "outline"} onClick={() => setLayout(l.value)} className="text-xs font-mono">
                                        {l.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("aspectRatio")}</Label>
                            <Select value={aspect} onValueChange={setAspect}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ASPECT_RATIOS.map(a => (
                                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="font-bold">{t("gap")}</Label>
                                <span className="font-mono text-primary">{gap}px</span>
                            </div>
                            <Slider value={[gap]} onValueChange={([v]) => setGap(v)} min={0} max={40} step={2} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="font-bold">{t("radius")}</Label>
                                <span className="font-mono text-primary">{borderRadius}px</span>
                            </div>
                            <Slider value={[borderRadius]} onValueChange={([v]) => setBorderRadius(v)} min={0} max={40} step={2} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("bgColor")}</Label>
                            <div className="flex gap-2">
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border/30 cursor-pointer" />
                                <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="font-bold">{t("outputSize")}</Label>
                                <span className="font-mono text-primary">{outputSize}px</span>
                            </div>
                            <Slider value={[outputSize]} onValueChange={([v]) => setOutputSize(v)} min={600} max={3000} step={100} />
                        </div>

                        <Button size="lg" className="w-full font-bold gap-2" onClick={exportCollage} disabled={images.length === 0}>
                            <Download className="w-4 h-4" />
                            {t("download")}
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
