"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Copy, CheckCircle2, Pipette, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { toast } from "sonner"

interface PickedColor {
    hex: string
    rgb: string
    hsl: string
    x: number
    y: number
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number): string {
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const delta = max - min
    let h = 0, s = 0
    const l = (max + min) / 2
    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1))
        switch (max) {
            case rn: h = ((gn - bn) / delta) % 6; break
            case gn: h = (bn - rn) / delta + 2; break
            case bn: h = (rn - gn) / delta + 4; break
        }
        h = Math.round(h * 60)
        if (h < 0) h += 360
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

export function ColorPicker() {
    const t = useTranslations("ColorPicker")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [pickedColors, setPickedColors] = useState<PickedColor[]>([])
    const [hoverColor, setHoverColor] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [zoomData, setZoomData] = useState<{ data: ImageData; x: number; y: number } | null>(null)
    const zoomCanvasRef = useRef<HTMLCanvasElement>(null)

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
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // Draw picked color markers
        pickedColors.forEach((c) => {
            ctx.beginPath()
            ctx.arc(c.x * scale, c.y * scale, 8, 0, Math.PI * 2)
            ctx.fillStyle = c.hex
            ctx.fill()
            ctx.strokeStyle = "#fff"
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.strokeStyle = "#000"
            ctx.lineWidth = 1
            ctx.stroke()
        })
    }, [image, pickedColors])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    // Draw zoom canvas
    useEffect(() => {
        const zc = zoomCanvasRef.current
        const zctx = zc?.getContext("2d")
        if (!zc || !zctx || !zoomData) return
        const size = 120
        const pixelSize = 10
        const gridSize = size / pixelSize
        zc.width = size
        zc.height = size
        zctx.imageSmoothingEnabled = false

        const halfGrid = Math.floor(gridSize / 2)
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const sx = (zoomData.x - halfGrid + x) * 4
                const sy = (zoomData.y - halfGrid + y)
                const idx = sy * zoomData.data.width * 4 + sx
                if (idx >= 0 && idx + 2 < zoomData.data.data.length) {
                    zctx.fillStyle = `rgb(${zoomData.data.data[idx]},${zoomData.data.data[idx + 1]},${zoomData.data.data[idx + 2]})`
                } else {
                    zctx.fillStyle = "#ccc"
                }
                zctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
            }
        }
        // Center crosshair
        zctx.strokeStyle = "rgba(255,255,255,0.8)"
        zctx.lineWidth = 1
        zctx.strokeRect(halfGrid * pixelSize, halfGrid * pixelSize, pixelSize, pixelSize)
    }, [zoomData])

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        const img = new Image()
        img.onload = () => { setImage(img); setPickedColors([]) }
        img.src = URL.createObjectURL(file)
    }

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !image) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = Math.floor((e.clientX - rect.left) * scaleX)
        const y = Math.floor((e.clientY - rect.top) * scaleY)

        // Re-draw clean to read pixel
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        const pixel = ctx.getImageData(x, y, 1, 1).data
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
        const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2])
        const scale = Math.min((containerRef.current?.clientWidth || canvas.width) / image.width, 500 / image.height, 1)

        setPickedColors(prev => [...prev, { hex, rgb, hsl, x: x / scale, y: y / scale }])
    }

    const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !image) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = Math.floor((e.clientX - rect.left) * scaleX)
        const y = Math.floor((e.clientY - rect.top) * scaleY)

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        const pixel = ctx.getImageData(x, y, 1, 1).data
        setHoverColor(rgbToHex(pixel[0], pixel[1], pixel[2]))

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        setZoomData({ data: imageData, x, y })
    }

    const copyColor = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(t("copied"))
        setTimeout(() => setCopiedField(null), 2000)
    }

    const clear = () => {
        setImage(null)
        setPickedColors([])
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
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    <div className="space-y-4">
                        <GlassCard className="p-4 relative">
                            <div ref={containerRef}>
                                <canvas
                                    ref={canvasRef}
                                    className="w-full rounded-lg cursor-crosshair"
                                    onClick={handleCanvasClick}
                                    onMouseMove={handleCanvasMove}
                                />
                            </div>
                            {/* Zoom lens */}
                            {zoomData && (
                                <div className="absolute top-6 right-6 rounded-xl overflow-hidden border-2 border-white/80 shadow-xl">
                                    <canvas ref={zoomCanvasRef} className="w-[120px] h-[120px]" />
                                    {hoverColor && (
                                        <div className="text-center text-[10px] font-mono font-bold py-1 bg-black/80 text-white">
                                            {hoverColor}
                                        </div>
                                    )}
                                </div>
                            )}
                        </GlassCard>
                    </div>

                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-4 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Pipette className="w-4 h-4 text-primary" />
                                    {t("pickedColors")} ({pickedColors.length})
                                </h3>
                                <div className="flex gap-1">
                                    {pickedColors.length > 0 && (
                                        <Button variant="ghost" size="sm" onClick={() => setPickedColors([])} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                                            {t("clearAll")}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {pickedColors.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">{t("hint")}</p>
                            )}

                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {pickedColors.map((color, i) => (
                                    <div key={i} className="rounded-xl border border-border/30 overflow-hidden">
                                        <div className="h-12 w-full" style={{ backgroundColor: color.hex }} />
                                        <div className="p-3 space-y-1.5">
                                            {[
                                                { label: "HEX", value: color.hex },
                                                { label: "RGB", value: color.rgb },
                                                { label: "HSL", value: color.hsl },
                                            ].map(({ label, value }) => {
                                                const key = `${i}-${label}`
                                                return (
                                                    <div key={label} className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
                                                        <button
                                                            onClick={() => copyColor(value, key)}
                                                            className="flex items-center gap-1 text-xs font-mono hover:text-primary transition-colors"
                                                        >
                                                            {value}
                                                            {copiedField === key
                                                                ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                                : <Copy className="w-3 h-3 opacity-40" />}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    )
}
