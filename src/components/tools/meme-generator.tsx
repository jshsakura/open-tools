"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Type, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

const KOREAN_FONT_FALLBACK = [
    '"Noto Sans KR"',
    '"Apple SD Gothic Neo"',
    '"Malgun Gothic"',
    '"Segoe UI"',
    'sans-serif',
].join(", ")

const MEME_FONT_FALLBACK = [
    'Impact',
    '"Arial Black"',
    KOREAN_FONT_FALLBACK,
].join(", ")

const KOREAN_REGEX = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/

export function MemeGenerator() {
    const t = useTranslations("MemeGenerator")
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const objectUrlRef = useRef<string | null>(null)

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [fileName, setFileName] = useState("meme-image")
    const [fileType, setFileType] = useState("image/png")
    const [topText, setTopText] = useState("")
    const [bottomText, setBottomText] = useState("")
    const [fontSize, setFontSize] = useState(48)
    const [textColor, setTextColor] = useState("#ffffff")
    const [strokeColor, setStrokeColor] = useState("#000000")
    const [strokeWidth, setStrokeWidth] = useState(3)

    const buildTextLines = useCallback((ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const normalizedText = text.trim()
        if (!normalizedText) return []

        const tokens = normalizedText.includes(" ")
            ? normalizedText.split(/\s+/)
            : Array.from(normalizedText)

        const lines: string[] = []
        let line = ""

        for (const token of tokens) {
            const separator = line && normalizedText.includes(" ") ? " " : ""
            const testLine = `${line}${separator}${token}`

            if (line && ctx.measureText(testLine).width > maxWidth * 0.9) {
                lines.push(line)
                line = token
            } else {
                line = testLine
            }
        }

        if (line) lines.push(line)
        return lines
    }, [])

    const drawMemeText = useCallback((ctx: CanvasRenderingContext2D, text: string, y: number, maxWidth: number, scale: number) => {
        if (!text.trim()) return
        ctx.save()
        const fontWeight = KOREAN_REGEX.test(text) ? 800 : 900
        ctx.font = `${fontWeight} ${fontSize * scale}px ${MEME_FONT_FALLBACK}`
        ctx.textAlign = "center"
        ctx.textBaseline = y < ctx.canvas.height / 2 ? "top" : "bottom"
        ctx.fillStyle = textColor
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth * scale
        ctx.lineJoin = "round"
        ctx.miterLimit = 2

        const normalizedText = KOREAN_REGEX.test(text) ? text.trim() : text.trim().toUpperCase()
        const lines = buildTextLines(ctx, normalizedText, maxWidth)

        const lineHeight = fontSize * scale * 1.2
        const startY = y < ctx.canvas.height / 2
            ? y + 10 * scale
            : y - lines.length * lineHeight - 10 * scale

        lines.forEach((l, i) => {
            const ly = startY + i * lineHeight + lineHeight / 2
            ctx.strokeText(l, ctx.canvas.width / 2, ly)
            ctx.fillText(l, ctx.canvas.width / 2, ly)
        })
        ctx.restore()
    }, [buildTextLines, fontSize, textColor, strokeColor, strokeWidth])

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || !image) return

        const container = containerRef.current
        if (!container) return
        const maxW = container.clientWidth || container.parentElement?.clientWidth || image.width
        const maxH = 600
        const scale = Math.min(maxW / image.width, maxH / image.height, 1)

        if (!Number.isFinite(scale) || scale <= 0) return

        canvas.width = image.width * scale
        canvas.height = image.height * scale
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        drawMemeText(ctx, topText, 0, canvas.width, scale)
        drawMemeText(ctx, bottomText, canvas.height, canvas.width, scale)
    }, [image, topText, bottomText, drawMemeText])

    useEffect(() => {
        drawCanvas()

        if (!("fonts" in document)) return

        let active = true

        document.fonts.ready.then(() => {
            if (active) {
                drawCanvas()
            }
        })

        return () => {
            active = false
        }
    }, [drawCanvas])

    useEffect(() => {
        const container = containerRef.current
        if (!container || !image) return

        const observer = new ResizeObserver(() => {
            drawCanvas()
        })

        observer.observe(container)

        return () => {
            observer.disconnect()
        }
    }, [drawCanvas, image])

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current)
            }
        }
    }, [])

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error(t("errorInvalid")); return }
        setFileName(file.name)
        setFileType(file.type || "image/png")

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current)
        }

        const objectUrl = URL.createObjectURL(file)
        objectUrlRef.current = objectUrl

        const img = new Image()
        img.decoding = "async"
        img.onload = () => setImage(img)
        img.onerror = () => {
            if (objectUrlRef.current === objectUrl) {
                URL.revokeObjectURL(objectUrl)
                objectUrlRef.current = null
            }
            toast.error(t("errorInvalid"))
        }
        img.src = objectUrl

        try {
            await img.decode()
            setImage(img)
        } catch {
        }
    }

    const exportMeme = async () => {
        if (!image) return
        await document.fonts.ready

        const c = document.createElement("canvas")
        c.width = image.width
        c.height = image.height
        const ctx = c.getContext("2d")!
        ctx.clearRect(0, 0, c.width, c.height)
        ctx.drawImage(image, 0, 0)
        drawMemeText(ctx, topText, 0, c.width, 1)
        drawMemeText(ctx, bottomText, c.height, c.width, 1)

        const exportType = fileType === "image/png" ? "image/png" : "image/jpeg"
        const outputName = fileName.replace(/\.[^.]+$/, "") || `meme_${Date.now()}`

        c.toBlob(blob => {
            if (!blob) return
            const a = document.createElement("a")
            const objectUrl = URL.createObjectURL(blob)
            a.href = objectUrl
            a.download = `${outputName}.${exportType === "image/png" ? "png" : "jpg"}`
            a.click()
            URL.revokeObjectURL(objectUrl)
            toast.success(t("downloaded"))
        }, exportType, exportType === "image/png" ? undefined : 0.92)
    }

    const clear = () => {
        setImage(null)
        setFileName("meme-image")
        setFileType("image/png")
        setTopText("")
        setBottomText("")
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current)
            objectUrlRef.current = null
        }
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
                            <canvas ref={canvasRef} className="block w-full h-auto rounded-lg" />
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-6 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Type className="w-4 h-4 text-primary" />
                                    {t("editor")}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("topText")}</Label>
                                <Input value={topText} onChange={e => setTopText(e.target.value)} placeholder={t("topTextPlaceholder")} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">{t("bottomText")}</Label>
                                <Input value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder={t("bottomTextPlaceholder")} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <Label className="font-bold">{t("fontSize")}</Label>
                                    <span className="font-mono text-primary">{fontSize}px</span>
                                </div>
                                <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={120} step={2} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">{t("textColor")}</Label>
                                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-lg border border-border/30 cursor-pointer" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">{t("strokeColor")}</Label>
                                    <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-10 rounded-lg border border-border/30 cursor-pointer" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <Label className="font-bold">{t("strokeWidth")}</Label>
                                    <span className="font-mono text-primary">{strokeWidth}px</span>
                                </div>
                                <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={0} max={10} step={1} />
                            </div>

                            <Button size="lg" className="w-full font-bold gap-2" onClick={exportMeme}>
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
