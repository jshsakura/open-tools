"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Type, Image as ImageIcon, Trash2, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tile"

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
    { value: "top-left", label: "↖" },
    { value: "top-right", label: "↗" },
    { value: "center", label: "⊕" },
    { value: "bottom-left", label: "↙" },
    { value: "bottom-right", label: "↘" },
    { value: "tile", label: "▦" },
]

export function ImageWatermark() {
    const t = useTranslations("ImageWatermark")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("")
    const [watermarkText, setWatermarkText] = useState("© My Watermark")
    const [fontSize, setFontSize] = useState(32)
    const [opacity, setOpacity] = useState(0.3)
    const [color, setColor] = useState("#ffffff")
    const [position, setPosition] = useState<WatermarkPosition>("bottom-right")
    const [rotation, setRotation] = useState(-30)

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

        // Draw watermark
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = color
        ctx.font = `bold ${fontSize * scale}px 'Inter', sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (position === "tile") {
            const textW = ctx.measureText(watermarkText).width + 40
            const textH = fontSize * scale * 2
            ctx.rotate((rotation * Math.PI) / 180)
            for (let y = -canvas.height; y < canvas.height * 2; y += textH) {
                for (let x = -canvas.width; x < canvas.width * 2; x += textW) {
                    ctx.fillText(watermarkText, x, y)
                }
            }
        } else {
            const padding = 30 * scale
            let x = canvas.width / 2
            let y = canvas.height / 2
            if (position === "top-left") { x = padding + ctx.measureText(watermarkText).width / 2; y = padding + fontSize * scale / 2 }
            else if (position === "top-right") { x = canvas.width - padding - ctx.measureText(watermarkText).width / 2; y = padding + fontSize * scale / 2 }
            else if (position === "bottom-left") { x = padding + ctx.measureText(watermarkText).width / 2; y = canvas.height - padding - fontSize * scale / 2 }
            else if (position === "bottom-right") { x = canvas.width - padding - ctx.measureText(watermarkText).width / 2; y = canvas.height - padding - fontSize * scale / 2 }

            // Text shadow
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4 * scale
            ctx.shadowOffsetX = 2 * scale
            ctx.shadowOffsetY = 2 * scale
            ctx.fillText(watermarkText, x, y)
        }
        ctx.restore()
    }, [image, watermarkText, fontSize, opacity, color, position, rotation])

    useEffect(() => { drawCanvas() }, [drawCanvas])

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        setFileName(file.name)
        const img = new Image()
        img.onload = () => setImage(img)
        img.src = URL.createObjectURL(file)
    }

    const exportImage = () => {
        if (!image) return
        const c = document.createElement("canvas")
        c.width = image.width
        c.height = image.height
        const ctx = c.getContext("2d")!
        ctx.drawImage(image, 0, 0)

        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = color
        ctx.font = `bold ${fontSize}px 'Inter', sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (position === "tile") {
            const textW = ctx.measureText(watermarkText).width + 40
            const textH = fontSize * 2
            ctx.rotate((rotation * Math.PI) / 180)
            for (let y = -c.height; y < c.height * 2; y += textH) {
                for (let x = -c.width; x < c.width * 2; x += textW) {
                    ctx.fillText(watermarkText, x, y)
                }
            }
        } else {
            const padding = 30
            let x = c.width / 2, y = c.height / 2
            if (position === "top-left") { x = padding + ctx.measureText(watermarkText).width / 2; y = padding + fontSize / 2 }
            else if (position === "top-right") { x = c.width - padding - ctx.measureText(watermarkText).width / 2; y = padding + fontSize / 2 }
            else if (position === "bottom-left") { x = padding + ctx.measureText(watermarkText).width / 2; y = c.height - padding - fontSize / 2 }
            else if (position === "bottom-right") { x = c.width - padding - ctx.measureText(watermarkText).width / 2; y = c.height - padding - fontSize / 2 }
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
            ctx.fillText(watermarkText, x, y)
        }
        ctx.restore()

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
                    <Button variant="secondary">{t("selectFile")}</Button>
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
                                <div className="flex justify-between text-sm">
                                    <Label className="text-xs font-bold">{t("opacity")}</Label>
                                    <span className="font-mono text-primary text-xs">{Math.round(opacity * 100)}%</span>
                                </div>
                                <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0.05} max={1} step={0.05} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("color")}</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border/30 cursor-pointer" />
                                    <Input value={color} onChange={e => setColor(e.target.value)} className="font-mono text-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("position")}</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {POSITIONS.map(p => (
                                        <Button key={p.value} size="sm" variant={position === p.value ? "default" : "outline"} onClick={() => setPosition(p.value)} className="text-base">
                                            {p.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {position === "tile" && (
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
