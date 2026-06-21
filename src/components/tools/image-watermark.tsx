"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Type, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import { placementXY, type WatermarkPosition } from "./image-watermark.utils"

type MarkType = "text" | "image"

const GRID_POSITIONS: { value: WatermarkPosition; label: string }[] = [
    { value: "top-left", label: "↖" },
    { value: "top-center", label: "↑" },
    { value: "top-right", label: "↗" },
    { value: "center-left", label: "←" },
    { value: "center", label: "⊕" },
    { value: "center-right", label: "→" },
    { value: "bottom-left", label: "↙" },
    { value: "bottom-center", label: "↓" },
    { value: "bottom-right", label: "↘" },
]

const BASE_MARGIN = 30

export function ImageWatermark() {
    const t = useTranslations("ImageWatermark")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("")
    const [markType, setMarkType] = useState<MarkType>("text")
    const [logo, setLogo] = useState<HTMLImageElement | null>(null)
    const [watermarkText, setWatermarkText] = useState("© My Watermark")
    const [fontSize, setFontSize] = useState(32)
    const [opacity, setOpacity] = useState(0.3)
    const [color, setColor] = useState("#ffffff")
    const [position, setPosition] = useState<WatermarkPosition>("bottom-right")
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(-30)
    const [tile, setTile] = useState(false)

    // Renders the watermark (text or logo) onto ctx at native resolution `r`
    // (1 for export, canvas/image scale for preview). Pure draw, no state.
    const drawWatermark = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, r: number) => {
        ctx.save()
        ctx.globalAlpha = opacity

        if (markType === "image" && logo) {
            const markW = logo.width * scale * r
            const markH = logo.height * scale * r
            if (tile) {
                drawTiled(ctx, w, h, markW + 40 * r, markH + 40 * r, rotation, (x, y) => {
                    ctx.drawImage(logo, x, y, markW, markH)
                })
            } else {
                const { x, y } = placementXY(position, w, h, markW, markH, BASE_MARGIN * r)
                ctx.drawImage(logo, x, y, markW, markH)
            }
            ctx.restore()
            return
        }

        // Text watermark
        ctx.fillStyle = color
        ctx.font = `bold ${fontSize * scale * r}px 'Inter', sans-serif`
        ctx.textBaseline = "top"
        const markW = ctx.measureText(watermarkText).width
        const markH = fontSize * scale * r

        if (tile) {
            drawTiled(ctx, w, h, markW + 40 * r, markH + 40 * r, rotation, (x, y) => {
                ctx.fillText(watermarkText, x, y)
            })
        } else {
            const { x, y } = placementXY(position, w, h, markW, markH, BASE_MARGIN * r)
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4 * r
            ctx.shadowOffsetX = 2 * r
            ctx.shadowOffsetY = 2 * r
            ctx.fillText(watermarkText, x, y)
        }
        ctx.restore()
    }, [markType, logo, watermarkText, fontSize, opacity, color, position, scale, rotation, tile])

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !image) return

        const container = containerRef.current
        if (!container) return
        const maxW = container.clientWidth
        const maxH = 500
        const r = Math.min(maxW / image.width, maxH / image.height, 1)

        canvas.width = image.width * r
        canvas.height = image.height * r
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        drawWatermark(ctx, canvas.width, canvas.height, r)
    }, [image, drawWatermark])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const loadImage = (file: File, onLoad: (img: HTMLImageElement) => void) => {
        const img = new Image()
        img.onload = () => onLoad(img)
        img.src = URL.createObjectURL(file)
    }

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        setFileName(file.name)
        loadImage(file, setImage)
    }

    const handleLogo = (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        loadImage(file, (img) => { setLogo(img); setMarkType("image") })
    }

    const exportImage = () => {
        if (!image) return
        const c = document.createElement("canvas")
        c.width = image.width
        c.height = image.height
        const ctx = c.getContext("2d")!
        ctx.drawImage(image, 0, 0)
        drawWatermark(ctx, c.width, c.height, 1)

        c.toBlob((blob) => {
            if (!blob) return
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `watermarked_${fileName}`
            a.click()
            toast.success(t("downloaded"))
        }, "image/png")
    }

    const clear = () => {
        setImage(null)
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
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    <GlassCard className="p-4">
                        <div ref={containerRef}>
                            <canvas ref={canvasRef} className="w-full rounded-lg" />
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-6 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Type className="w-4 h-4 text-primary" />
                                    {t("settings")}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Watermark type */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("markType")}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant={markType === "text" ? "default" : "outline"} onClick={() => setMarkType("text")} className="text-xs gap-1">
                                        <Type className="w-3 h-3" /> {t("typeText")}
                                    </Button>
                                    <Button size="sm" variant={markType === "image" ? "default" : "outline"} onClick={() => setMarkType("image")} className="text-xs gap-1">
                                        <ImageIcon className="w-3 h-3" /> {t("typeImage")}
                                    </Button>
                                </div>
                            </div>

                            {markType === "text" ? (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">{t("text")}</Label>
                                        <Input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="© Your Name" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <Label className="text-xs font-bold">{t("fontSize")}</Label>
                                            <span className="font-mono text-primary text-xs">{fontSize}px</span>
                                        </div>
                                        <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={12} max={120} step={2} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">{t("color")}</Label>
                                        <div className="flex gap-2">
                                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border/30 cursor-pointer" />
                                            <Input value={color} onChange={e => setColor(e.target.value)} className="font-mono text-sm" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">{t("logo")}</Label>
                                    <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogo(f) }} />
                                    <Button size="sm" variant="outline" onClick={() => logoInputRef.current?.click()} className="w-full text-xs gap-1">
                                        <Upload className="w-3 h-3" /> {logo ? t("logoChange") : t("logoUpload")}
                                    </Button>
                                    {logo && <p className="text-xs text-muted-foreground">{logo.width} × {logo.height} px</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label className="text-xs font-bold">{t("opacity")}</Label>
                                    <span className="font-mono text-primary text-xs">{Math.round(opacity * 100)}%</span>
                                </div>
                                <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0.05} max={1} step={0.05} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label className="text-xs font-bold">{t("scale")}</Label>
                                    <span className="font-mono text-primary text-xs">{Math.round(scale * 100)}%</span>
                                </div>
                                <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={0.25} max={3} step={0.05} />
                            </div>

                            {/* 9-grid position (hidden in tile mode) */}
                            {!tile && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">{t("position")}</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {GRID_POSITIONS.map(p => (
                                            <Button key={p.value} size="sm" variant={position === p.value ? "default" : "outline"} onClick={() => setPosition(p.value)} className="text-base">
                                                {p.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tile toggle */}
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold">{t("tileMode")}</Label>
                                <Button size="sm" variant={tile ? "default" : "outline"} onClick={() => setTile(v => !v)} className="text-xs">
                                    {tile ? t("on") : t("off")}
                                </Button>
                            </div>

                            {tile && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <Label className="text-xs font-bold">{t("tileRotation")}</Label>
                                        <span className="font-mono text-primary text-xs">{rotation}°</span>
                                    </div>
                                    <Slider value={[rotation]} onValueChange={([v]) => setRotation(v)} min={-90} max={90} step={5} />
                                </div>
                            )}

                            <Button size="lg" className="w-full font-bold gap-2" onClick={exportImage}>
                                <Download className="w-4 h-4" />
                                {t("download")}
                            </Button>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    )
}

// Stamps a mark across the whole canvas at a rotation. Uses an over-scan range
// so the rotated grid still covers every corner.
function drawTiled(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    stepX: number,
    stepY: number,
    rotation: number,
    stamp: (x: number, y: number) => void
) {
    if (stepX <= 0 || stepY <= 0) return
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    const reach = Math.max(w, h)
    for (let y = -reach; y < reach; y += stepY) {
        for (let x = -reach; x < reach; x += stepX) {
            stamp(x, y)
        }
    }
    ctx.restore()
}
