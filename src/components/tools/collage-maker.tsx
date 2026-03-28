"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Plus, Trash2, LayoutGrid, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type LayoutType = "2x1" | "1x2" | "2x2" | "3x1" | "1x3" | "3x3"

const LAYOUTS: { value: LayoutType; cols: number; rows: number; label: string }[] = [
    { value: "2x1", cols: 2, rows: 1, label: "2×1" },
    { value: "1x2", cols: 1, rows: 2, label: "1×2" },
    { value: "2x2", cols: 2, rows: 2, label: "2×2" },
    { value: "3x1", cols: 3, rows: 1, label: "3×1" },
    { value: "1x3", cols: 1, rows: 3, label: "1×3" },
    { value: "3x3", cols: 3, rows: 3, label: "3×3" },
]

interface ImageSlot {
    id: string
    image: HTMLImageElement
    file: File
}

export function CollageMaker() {
    const t = useTranslations("CollageMaker")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [images, setImages] = useState<ImageSlot[]>([])
    const [layout, setLayout] = useState<LayoutType>("2x2")
    const [gap, setGap] = useState(8)
    const [bgColor, setBgColor] = useState("#ffffff")
    const [borderRadius, setBorderRadius] = useState(0)
    const [canvasSize, setCanvasSize] = useState(1200)

    const currentLayout = LAYOUTS.find(l => l.value === layout)!
    const totalSlots = currentLayout.cols * currentLayout.rows

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const displaySize = Math.min(canvasSize, 800)
        const scale = displaySize / canvasSize
        canvas.width = displaySize
        canvas.height = displaySize

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, displaySize, displaySize)

        const cellW = (canvasSize - gap * (currentLayout.cols + 1)) / currentLayout.cols
        const cellH = (canvasSize - gap * (currentLayout.rows + 1)) / currentLayout.rows

        for (let row = 0; row < currentLayout.rows; row++) {
            for (let col = 0; col < currentLayout.cols; col++) {
                const idx = row * currentLayout.cols + col
                const x = (gap + col * (cellW + gap)) * scale
                const y = (gap + row * (cellH + gap)) * scale
                const w = cellW * scale
                const h = cellH * scale
                const r = borderRadius * scale

                ctx.save()
                // Rounded rect clip
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.lineTo(x + w - r, y)
                ctx.quadraticCurveTo(x + w, y, x + w, y + r)
                ctx.lineTo(x + w, y + h - r)
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
                ctx.lineTo(x + r, y + h)
                ctx.quadraticCurveTo(x, y + h, x, y + h - r)
                ctx.lineTo(x, y + r)
                ctx.quadraticCurveTo(x, y, x + r, y)
                ctx.closePath()
                ctx.clip()

                if (images[idx]) {
                    const img = images[idx].image
                    // Cover fit
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
                } else {
                    ctx.fillStyle = "rgba(128,128,128,0.1)"
                    ctx.fillRect(x, y, w, h)
                    ctx.strokeStyle = "rgba(128,128,128,0.3)"
                    ctx.setLineDash([6, 4])
                    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
                    ctx.setLineDash([])

                    // Plus icon
                    ctx.fillStyle = "rgba(128,128,128,0.3)"
                    ctx.font = `bold ${24 * scale}px sans-serif`
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillText("+", x + w / 2, y + h / 2)
                }
                ctx.restore()
            }
        }
    }, [images, layout, gap, bgColor, borderRadius, canvasSize, currentLayout])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const handleFiles = (files: FileList) => {
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

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx))
    }

    const exportCollage = () => {
        const c = document.createElement("canvas")
        c.width = canvasSize
        c.height = canvasSize
        const ctx = c.getContext("2d")!

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvasSize, canvasSize)

        const cellW = (canvasSize - gap * (currentLayout.cols + 1)) / currentLayout.cols
        const cellH = (canvasSize - gap * (currentLayout.rows + 1)) / currentLayout.rows

        for (let row = 0; row < currentLayout.rows; row++) {
            for (let col = 0; col < currentLayout.cols; col++) {
                const idx = row * currentLayout.cols + col
                const x = gap + col * (cellW + gap)
                const y = gap + row * (cellH + gap)

                ctx.save()
                ctx.beginPath()
                ctx.moveTo(x + borderRadius, y)
                ctx.lineTo(x + cellW - borderRadius, y)
                ctx.quadraticCurveTo(x + cellW, y, x + cellW, y + borderRadius)
                ctx.lineTo(x + cellW, y + cellH - borderRadius)
                ctx.quadraticCurveTo(x + cellW, y + cellH, x + cellW - borderRadius, y + cellH)
                ctx.lineTo(x + borderRadius, y + cellH)
                ctx.quadraticCurveTo(x, y + cellH, x, y + cellH - borderRadius)
                ctx.lineTo(x, y + borderRadius)
                ctx.quadraticCurveTo(x, y, x + borderRadius, y)
                ctx.closePath()
                ctx.clip()

                if (images[idx]) {
                    const img = images[idx].image
                    const imgRatio = img.width / img.height
                    const cellRatio = cellW / cellH
                    let sx = 0, sy = 0, sw = img.width, sh = img.height
                    if (imgRatio > cellRatio) { sw = img.height * cellRatio; sx = (img.width - sw) / 2 }
                    else { sh = img.width / cellRatio; sy = (img.height - sh) / 2 }
                    ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH)
                }
                ctx.restore()
            }
        }

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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                    <GlassCard className="p-4">
                        <canvas ref={canvasRef} className="w-full rounded-lg" />
                    </GlassCard>

                    {/* Image slots */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold">{t("images")} ({images.length}/{totalSlots})</h3>
                            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={images.length >= totalSlots} className="gap-1">
                                <Plus className="w-3 h-3" /> {t("addImage")}
                            </Button>
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
                                <span className="font-mono text-primary">{canvasSize}px</span>
                            </div>
                            <Slider value={[canvasSize]} onValueChange={([v]) => setCanvasSize(v)} min={600} max={3000} step={100} />
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
