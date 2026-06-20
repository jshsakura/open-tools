"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Trash2, ArrowUp, ArrowDown, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

type PageSize = "a4" | "letter" | "fit"

interface ImageItem {
    id: string
    file: File
    dataUrl: string
    width: number
    height: number
}

// Point dimensions (1pt = 1/72in). pdf-lib works in points.
const PAGE_DIMENSIONS: Record<Exclude<PageSize, "fit">, { w: number; h: number }> = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 },
}
const MM_TO_PT = 2.83465

const readImage = (file: File): Promise<ImageItem> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error("read-failed"))
        reader.onload = () => {
            const dataUrl = reader.result as string
            const img = new Image()
            img.onerror = () => reject(new Error("decode-failed"))
            img.onload = () =>
                resolve({
                    id: crypto.randomUUID(),
                    file,
                    dataUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                })
            img.src = dataUrl
        }
        reader.readAsDataURL(file)
    })

// pdf-lib only embeds PNG/JPEG natively; re-encode anything else via canvas.
const toEmbeddable = async (file: File): Promise<{ bytes: ArrayBuffer | Uint8Array; type: "png" | "jpg" }> => {
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
        return { bytes: await file.arrayBuffer(), type: "jpg" }
    }
    if (file.type === "image/png") {
        return { bytes: await file.arrayBuffer(), type: "png" }
    }
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(bitmap, 0, 0)
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"))
    return { bytes: await blob.arrayBuffer(), type: "png" }
}

export function ImageToPdf() {
    const t = useTranslations("ImageToPdf")

    const [images, setImages] = useState<ImageItem[]>([])
    const [pageSize, setPageSize] = useState<PageSize>("a4")
    const [marginMm, setMarginMm] = useState(10)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addFiles = useCallback(async (fileList: FileList | File[]) => {
        const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"))
        if (files.length === 0) {
            toast.error(t("errorNoImage"))
            return
        }
        try {
            const loaded = await Promise.all(files.map(readImage))
            setImages((prev) => [...prev, ...loaded])
        } catch {
            toast.error(t("errorLoad"))
        }
    }, [t])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
    }

    const move = (index: number, dir: -1 | 1) => {
        setImages((prev) => {
            const next = [...prev]
            const target = index + dir
            if (target < 0 || target >= next.length) return prev
            ;[next[index], next[target]] = [next[target], next[index]]
            return next
        })
    }

    const remove = (id: string) => setImages((prev) => prev.filter((s) => s.id !== id))

    const generate = async () => {
        if (images.length === 0) return
        setIsGenerating(true)
        try {
            const { PDFDocument } = await import("pdf-lib")
            const pdf = await PDFDocument.create()
            const margin = marginMm * MM_TO_PT

            for (const item of images) {
                const { bytes, type } = await toEmbeddable(item.file)
                const embedded = type === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes)
                const imgRatio = item.width / item.height

                let pageW: number
                let pageH: number
                if (pageSize === "fit") {
                    // Page tightly matches the image (plus margins).
                    pageW = embedded.width + margin * 2
                    pageH = embedded.height + margin * 2
                } else {
                    const base = PAGE_DIMENSIONS[pageSize]
                    // Auto-orient the page to the image.
                    const landscape = imgRatio > 1
                    pageW = landscape ? base.h : base.w
                    pageH = landscape ? base.w : base.h
                }

                const page = pdf.addPage([pageW, pageH])
                const availW = pageW - margin * 2
                const availH = pageH - margin * 2
                // Contain: fit within the printable area, preserve aspect, center.
                let drawW = availW
                let drawH = availW / imgRatio
                if (drawH > availH) {
                    drawH = availH
                    drawW = availH * imgRatio
                }
                page.drawImage(embedded, {
                    x: (pageW - drawW) / 2,
                    y: (pageH - drawH) / 2,
                    width: drawW,
                    height: drawH,
                })
            }

            const pdfBytes = await pdf.save()
            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = `images_${images.length}_${Date.now()}.pdf`
            a.click()
            URL.revokeObjectURL(a.href)
            toast.success(t("generated", { count: images.length }))
        } catch (err) {
            console.error("PDF generation failed:", err)
            toast.error(t("errorGenerate"))
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
                            isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/25 bg-secondary/40 hover:bg-secondary/60"
                        }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-lg font-bold">{t("dropTitle")}</p>
                        <p className="text-sm text-muted-foreground">{t("dropHint")}</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addFiles(e.target.files)
                                e.target.value = ""
                            }}
                        />
                    </div>

                    {images.length > 0 && (
                        <GlassCard className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold">
                                    {t("pages")} ({images.length})
                                </h3>
                                <Button size="sm" variant="ghost" onClick={() => setImages([])} className="gap-1 text-destructive">
                                    <Trash2 className="w-3 h-3" /> {t("clearAll")}
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {images.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-lg overflow-hidden border border-border/40 bg-white"
                                    >
                                        <div className="aspect-[1/1.414] flex items-center justify-center overflow-hidden">
                                            <img src={item.dataUrl} alt={`page ${i + 1}`} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            {i + 1}
                                        </span>
                                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-white/20 disabled:opacity-30" aria-label={t("moveUp")}>
                                                <ArrowUp className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button onClick={() => move(i, 1)} disabled={i === images.length - 1} className="p-1 rounded hover:bg-white/20 disabled:opacity-30" aria-label={t("moveDown")}>
                                                <ArrowDown className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button onClick={() => remove(item.id)} className="p-1 rounded hover:bg-white/20" aria-label={t("remove")}>
                                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                <div className="space-y-6">
                    <GlassCard className="p-6 space-y-6 sticky top-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            {t("settings")}
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">{t("pageSize")}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["a4", "letter", "fit"] as PageSize[]).map((p) => (
                                    <Button key={p} size="sm" variant={pageSize === p ? "default" : "outline"} onClick={() => setPageSize(p)} className="text-xs">
                                        {t(`size_${p}`)}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {pageSize === "fit" ? t("sizeFitHint") : t("sizeFixedHint")}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="font-bold">{t("margin")}</Label>
                                <span className="font-mono text-primary">{marginMm}mm</span>
                            </div>
                            <Slider value={[marginMm]} onValueChange={([v]) => setMarginMm(v)} min={0} max={40} step={1} />
                        </div>

                        <Button size="lg" className="w-full font-bold gap-2" onClick={generate} disabled={images.length === 0 || isGenerating}>
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isGenerating ? t("generating") : t("generate")}
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
