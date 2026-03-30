"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, RotateCw, FlipHorizontal, FlipVertical, Crop, Trash2, Square, RectangleHorizontal, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "9:16" | "3:2"

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: React.ElementType }[] = [
    { value: "free", label: "Free", icon: Crop },
    { value: "1:1", label: "1:1", icon: Square },
    { value: "4:3", label: "4:3", icon: RectangleHorizontal },
    { value: "16:9", label: "16:9", icon: RectangleHorizontal },
    { value: "9:16", label: "9:16", icon: Smartphone },
    { value: "3:2", label: "3:2", icon: RectangleHorizontal },
]

export function ImageCropper() {
    const t = useTranslations("ImageCropper")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("")
    const [rotation, setRotation] = useState(0)
    const [flipH, setFlipH] = useState(false)
    const [flipV, setFlipV] = useState(false)
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free")

    // Crop region in image coordinates
    const [cropRegion, setCropRegion] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [dragMode, setDragMode] = useState<"new" | "move" | null>(null)

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

        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
        ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
        ctx.restore()

        // Draw overlay
        if (cropRegion.w > 0 && cropRegion.h > 0) {
            const sx = cropRegion.x * scale
            const sy = cropRegion.y * scale
            const sw = cropRegion.w * scale
            const sh = cropRegion.h * scale

            ctx.fillStyle = "rgba(0,0,0,0.5)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.clearRect(sx, sy, sw, sh)
            ctx.drawImage(image, cropRegion.x, cropRegion.y, cropRegion.w, cropRegion.h, sx, sy, sw, sh)

            ctx.strokeStyle = "#fff"
            ctx.lineWidth = 2
            ctx.setLineDash([6, 3])
            ctx.strokeRect(sx, sy, sw, sh)
            ctx.setLineDash([])

            // Rule of thirds
            ctx.strokeStyle = "rgba(255,255,255,0.3)"
            ctx.lineWidth = 1
            for (let i = 1; i <= 2; i++) {
                ctx.beginPath()
                ctx.moveTo(sx + (sw * i) / 3, sy)
                ctx.lineTo(sx + (sw * i) / 3, sy + sh)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(sx, sy + (sh * i) / 3)
                ctx.lineTo(sx + sw, sy + (sh * i) / 3)
                ctx.stroke()
            }

            // Corner handles
            const hs = 8
            ctx.fillStyle = "#fff"
            ctx.shadowColor = "rgba(0,0,0,0.3)"
            ctx.shadowBlur = 4
            for (const [cx, cy] of [[sx, sy], [sx + sw, sy], [sx, sy + sh], [sx + sw, sy + sh]]) {
                ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs)
            }
            ctx.shadowBlur = 0
        }
    }, [image, rotation, flipH, flipV, cropRegion])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error(t("errorInvalid"))
            return
        }
        setFileName(file.name)
        const img = new Image()
        img.onload = () => {
            setImage(img)
            setCropRegion({ x: 0, y: 0, w: 0, h: 0 })
            setRotation(0)
            setFlipH(false)
            setFlipV(false)
        }
        img.src = URL.createObjectURL(file)
    }

    const getCanvasScale = () => {
        if (!canvasRef.current || !image) return 1
        return canvasRef.current.width / image.width
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const cx = (e.clientX - rect.left) * scaleX
        const cy = (e.clientY - rect.top) * scaleY
        const scale = getCanvasScale()

        const sx = cropRegion.x * scale
        const sy = cropRegion.y * scale
        const sw = cropRegion.w * scale
        const sh = cropRegion.h * scale

        if (cropRegion.w > 0 && cx >= sx && cx <= sx + sw && cy >= sy && cy <= sy + sh) {
            setDragMode("move")
            setDragStart({ x: cx - sx, y: cy - sy })
        } else {
            setDragMode("new")
            setDragStart({ x: cx / scale, y: cy / scale })
            setCropRegion({ x: cx / scale, y: cy / scale, w: 0, h: 0 })
        }
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !image) return
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const cx = (e.clientX - rect.left) * scaleX
        const cy = (e.clientY - rect.top) * scaleY
        const scale = getCanvasScale()

        if (dragMode === "new") {
            let w = cx / scale - dragStart.x
            let h = cy / scale - dragStart.y

            if (aspectRatio !== "free") {
                const [aw, ah] = aspectRatio.split(":").map(Number)
                const ratio = aw / ah
                if (Math.abs(w) / ratio > Math.abs(h)) {
                    h = w / ratio
                } else {
                    w = h * ratio
                }
            }

            setCropRegion({
                x: w >= 0 ? dragStart.x : dragStart.x + w,
                y: h >= 0 ? dragStart.y : dragStart.y + h,
                w: Math.abs(w),
                h: Math.abs(h),
            })
        } else if (dragMode === "move") {
            const nx = Math.max(0, Math.min(image.width - cropRegion.w, (cx - dragStart.x) / scale))
            const ny = Math.max(0, Math.min(image.height - cropRegion.h, (cy - dragStart.y) / scale))
            setCropRegion(prev => ({ ...prev, x: nx, y: ny }))
        }
    }

    const handleMouseUp = () => setIsDragging(false)

    const exportCrop = () => {
        if (!image || cropRegion.w <= 0) return
        const c = document.createElement("canvas")
        c.width = cropRegion.w
        c.height = cropRegion.h
        const ctx = c.getContext("2d")!
        ctx.save()
        ctx.translate(c.width / 2, c.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
        ctx.drawImage(image, -cropRegion.x - cropRegion.w / 2, -cropRegion.y - cropRegion.h / 2)
        ctx.restore()

        c.toBlob((blob) => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `cropped_${fileName}`
            a.click()
            URL.revokeObjectURL(url)
            toast.success(t("downloaded"))
        }, "image/png")
    }

    const clear = () => {
        setImage(null)
        setCropRegion({ x: 0, y: 0, w: 0, h: 0 })
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <Button variant="secondary">{t("selectFile")}</Button>
                </GlassCard>
            ) : (
                <div className="grid lg:grid-cols-[1fr_280px] gap-8">
                    <GlassCard className="p-4">
                        <div ref={containerRef} className="relative">
                            <canvas
                                ref={canvasRef}
                                className="w-full cursor-crosshair rounded-lg"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            />
                        </div>
                        {cropRegion.w > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full border border-border/40 px-3 py-1">
                                    {Math.round(cropRegion.w)} × {Math.round(cropRegion.h)} px
                                </span>
                            </div>
                        )}
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-6 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Crop className="w-4 h-4 text-primary" />
                                    {t("controls")}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("aspectRatio")}</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ASPECT_RATIOS.map(r => (
                                        <Button
                                            key={r.value}
                                            size="sm"
                                            variant={aspectRatio === r.value ? "default" : "outline"}
                                            onClick={() => setAspectRatio(r.value)}
                                            className="text-xs gap-1"
                                        >
                                            <r.icon className="w-3 h-3" />
                                            {r.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Transform */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("transform")}</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setRotation(r => (r + 90) % 360)} className="text-xs gap-1">
                                        <RotateCw className="w-3 h-3" /> 90°
                                    </Button>
                                    <Button size="sm" variant={flipH ? "default" : "outline"} onClick={() => setFlipH(!flipH)} className="text-xs gap-1">
                                        <FlipHorizontal className="w-3 h-3" /> H
                                    </Button>
                                    <Button size="sm" variant={flipV ? "default" : "outline"} onClick={() => setFlipV(!flipV)} className="text-xs gap-1">
                                        <FlipVertical className="w-3 h-3" /> V
                                    </Button>
                                </div>
                            </div>

                            <Button size="lg" className="w-full font-bold gap-2" onClick={exportCrop} disabled={cropRegion.w <= 0}>
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
