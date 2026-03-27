"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, MonitorSmartphone, Smartphone, AppWindow, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FrameType = "none" | "browser" | "macos" | "phone"
type BgType = "solid" | "gradient" | "transparent"

const GRADIENT_PRESETS = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    "linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)",
]

export function ScreenshotBeautifierTool() {
    const t = useTranslations("ScreenshotBeautifier")
    const [image, setImage] = useState<string | null>(null)
    const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
    const [frame, setFrame] = useState<FrameType>("none")
    const [bgType, setBgType] = useState<BgType>("gradient")
    const [bgColor, setBgColor] = useState("#6366f1")
    const [gradientIndex, setGradientIndex] = useState(0)
    const [padding, setPadding] = useState(48)
    const [borderRadius, setBorderRadius] = useState(12)
    const [shadow, setShadow] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return
        const reader = new FileReader()
        reader.onload = (e) => {
            const src = e.target?.result as string
            setImage(src)
            const img = new Image()
            img.onload = () => setImageEl(img)
            img.src = src
        }
        reader.readAsDataURL(file)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return
        for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile()
                if (file) handleFile(file)
                break
            }
        }
    }, [handleFile])

    useEffect(() => {
        document.addEventListener("paste", handlePaste)
        return () => document.removeEventListener("paste", handlePaste)
    }, [handlePaste])

    const getFrameHeight = () => {
        if (frame === "browser" || frame === "macos") return 36
        if (frame === "phone") return 24
        return 0
    }

    const drawFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
        const frameH = getFrameHeight()
        if (frame === "browser") {
            ctx.fillStyle = "#e5e7eb"
            ctx.beginPath()
            ctx.roundRect(x, y, w, frameH, [borderRadius, borderRadius, 0, 0])
            ctx.fill()
            const dotColors = ["#ef4444", "#eab308", "#22c55e"]
            dotColors.forEach((c, i) => {
                ctx.fillStyle = c
                ctx.beginPath()
                ctx.arc(x + 16 + i * 20, y + frameH / 2, 5, 0, Math.PI * 2)
                ctx.fill()
            })
            ctx.fillStyle = "#d1d5db"
            ctx.beginPath()
            ctx.roundRect(x + 80, y + 8, w - 100, 20, 10)
            ctx.fill()
        } else if (frame === "macos") {
            ctx.fillStyle = "#f3f4f6"
            ctx.beginPath()
            ctx.roundRect(x, y, w, frameH, [borderRadius, borderRadius, 0, 0])
            ctx.fill()
            const dotColors = ["#ef4444", "#eab308", "#22c55e"]
            dotColors.forEach((c, i) => {
                ctx.fillStyle = c
                ctx.beginPath()
                ctx.arc(x + 16 + i * 20, y + frameH / 2, 6, 0, Math.PI * 2)
                ctx.fill()
            })
        } else if (frame === "phone") {
            ctx.fillStyle = "#1f2937"
            ctx.beginPath()
            ctx.roundRect(x, y, w, h + frameH * 2, borderRadius)
            ctx.fill()
            ctx.fillStyle = "#4b5563"
            ctx.beginPath()
            ctx.roundRect(x + w / 2 - 30, y + 8, 60, 8, 4)
            ctx.fill()
        }
    }

    const renderCanvas = useCallback(() => {
        if (!canvasRef.current || !imageEl) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        const frameH = getFrameHeight()
        const totalFrameH = frame === "phone" ? frameH * 2 : frameH
        const imgW = imageEl.width
        const imgH = imageEl.height
        const cw = imgW + padding * 2
        const ch = imgH + padding * 2 + totalFrameH

        canvasRef.current.width = cw
        canvasRef.current.height = ch

        if (bgType === "transparent") {
            ctx.clearRect(0, 0, cw, ch)
        } else if (bgType === "gradient") {
            const gradient = GRADIENT_PRESETS[gradientIndex]
            const match = gradient.match(/(\d+)deg/)
            const angle = match ? parseInt(match[1]) : 135
            const rad = (angle * Math.PI) / 180
            const x1 = cw / 2 - (Math.cos(rad) * cw) / 2
            const y1 = ch / 2 - (Math.sin(rad) * ch) / 2
            const x2 = cw / 2 + (Math.cos(rad) * cw) / 2
            const y2 = ch / 2 + (Math.sin(rad) * ch) / 2
            const colors = gradient.match(/#[0-9a-fA-F]{6}/g) || ["#667eea", "#764ba2"]
            const g = ctx.createLinearGradient(x1, y1, x2, y2)
            g.addColorStop(0, colors[0])
            g.addColorStop(1, colors[1] || colors[0])
            ctx.fillStyle = g
            ctx.fillRect(0, 0, cw, ch)
        } else {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, cw, ch)
        }

        const sx = padding
        const sy = padding
        const sw = imgW
        const sh = imgH + totalFrameH

        if (shadow) {
            ctx.shadowColor = "rgba(0,0,0,0.3)"
            ctx.shadowBlur = 30
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 10
        }

        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, borderRadius)
        ctx.fill()
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        if (frame !== "none") {
            drawFrame(ctx, sx, sy, sw, sh)
        }

        ctx.save()
        ctx.beginPath()
        const imgY = sy + totalFrameH
        if (frame === "none") {
            ctx.roundRect(sx, sy, sw, imgH, borderRadius)
        } else if (frame === "phone") {
            ctx.roundRect(sx + 2, imgY, sw - 4, imgH, 0)
        } else {
            ctx.roundRect(sx, imgY, sw, imgH, [0, 0, borderRadius, borderRadius])
        }
        ctx.clip()
        ctx.drawImage(imageEl, sx + (frame === "phone" ? 2 : 0), frame === "none" ? sy : imgY, frame === "phone" ? sw - 4 : sw, imgH)
        ctx.restore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageEl, frame, bgType, bgColor, gradientIndex, padding, borderRadius, shadow])

    useEffect(() => {
        renderCanvas()
    }, [renderCanvas])

    const handleExport = () => {
        if (!canvasRef.current) return
        const link = document.createElement("a")
        link.download = "screenshot-beautified.png"
        link.href = canvasRef.current.toDataURL("image/png")
        link.click()
        toast.success(t("exported"))
    }

    const handleReset = () => {
        setImage(null)
        setImageEl(null)
    }

    return (
        <div className="space-y-6">
            {!image ? (
                <Card>
                    <CardContent
                        className="p-12 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 text-muted-foreground/50" />
                        <div className="text-center">
                            <p className="font-medium">{t("dropTitle")}</p>
                            <p className="text-sm text-muted-foreground">{t("dropDesc")}</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleFile(f)
                            }}
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Controls */}
                        <Card className="lg:col-span-1">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{t("settings")}</h3>
                                    <Button variant="ghost" size="sm" onClick={handleReset}>
                                        <X className="w-4 h-4 mr-1" />{t("reset")}
                                    </Button>
                                </div>

                                {/* Frame */}
                                <div className="space-y-2">
                                    <Label>{t("frame")}</Label>
                                    <Select value={frame} onValueChange={(v) => setFrame(v as FrameType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">{t("frameNone")}</SelectItem>
                                            <SelectItem value="browser">{t("frameBrowser")}</SelectItem>
                                            <SelectItem value="macos">{t("frameMacos")}</SelectItem>
                                            <SelectItem value="phone">{t("framePhone")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Background */}
                                <div className="space-y-2">
                                    <Label>{t("background")}</Label>
                                    <Select value={bgType} onValueChange={(v) => setBgType(v as BgType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="solid">{t("bgSolid")}</SelectItem>
                                            <SelectItem value="gradient">{t("bgGradient")}</SelectItem>
                                            <SelectItem value="transparent">{t("bgTransparent")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {bgType === "solid" && (
                                    <div className="space-y-2">
                                        <Label>{t("bgColorLabel")}</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer border"
                                            />
                                            <Input
                                                value={bgColor}
                                                onChange={(e) => setBgColor(e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                )}

                                {bgType === "gradient" && (
                                    <div className="space-y-2">
                                        <Label>{t("bgGradientPresets")}</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {GRADIENT_PRESETS.map((g, i) => (
                                                <button
                                                    key={i}
                                                    className={cn(
                                                        "w-full aspect-square rounded-lg border-2 transition-all",
                                                        i === gradientIndex ? "border-primary scale-110" : "border-transparent"
                                                    )}
                                                    style={{ background: g }}
                                                    onClick={() => setGradientIndex(i)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Padding */}
                                <div className="space-y-2">
                                    <Label>{t("padding")}: {padding}px</Label>
                                    <Slider
                                        value={[padding]}
                                        onValueChange={([v]) => setPadding(v)}
                                        min={16}
                                        max={128}
                                        step={4}
                                    />
                                </div>

                                {/* Border Radius */}
                                <div className="space-y-2">
                                    <Label>{t("borderRadius")}: {borderRadius}px</Label>
                                    <Slider
                                        value={[borderRadius]}
                                        onValueChange={([v]) => setBorderRadius(v)}
                                        min={0}
                                        max={32}
                                        step={2}
                                    />
                                </div>

                                {/* Shadow */}
                                <div className="flex items-center justify-between">
                                    <Label>{t("shadow")}</Label>
                                    <Switch checked={shadow} onCheckedChange={setShadow} />
                                </div>

                                <Button onClick={handleExport} className="w-full">
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("export")}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card className="lg:col-span-2">
                            <CardContent className="p-6">
                                <Label className="mb-3 block">{t("preview")}</Label>
                                <div className="flex items-center justify-center overflow-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')] rounded-lg p-4 min-h-[300px]">
                                    <canvas
                                        ref={canvasRef}
                                        className="max-w-full max-h-[600px] object-contain"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
