"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Download,
    RefreshCw,
    ImageDown,
    ZoomIn,
    ArrowRight,
    FileType,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { formatBytes } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageState {
    file: File | null
    preview: string | null
    width: number
    height: number
    size: number
}

export function ImageCompressor() {
    const t = useTranslations('ImageCompressor')

    // State
    const [original, setOriginal] = useState<ImageState | null>(null)
    const [compressed, setCompressed] = useState<ImageState | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Settings
    const [quality, setQuality] = useState(0.8)
    const [scale, setScale] = useState(1.0)

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Process Image Logic
    const processImage = useCallback(async (file: File, q: number, s: number) => {
        if (!file) return

        setIsProcessing(true)
        const img = new Image()
        img.src = URL.createObjectURL(file)

        await new Promise((resolve) => {
            img.onload = resolve
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            toast.error(t('errorCanvas'))
            setIsProcessing(false)
            return
        }

        const newWidth = Math.floor(img.width * s)
        const newHeight = Math.floor(img.height * s)

        canvas.width = newWidth
        canvas.height = newHeight

        // Better scaling quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Compress
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg' // PNG doesn't support quality param in toBlob, but we can try WEBP or just keep consistent
        const outputType = 'image/jpeg' // Force JPEG/WEBP for compression or keep original? Let's use JPEG for compression demo usually, or WEBP.
        // Let's stick to: if PNG -> PNG (lossless usually, scale only affects), if JPG/WebP -> lossy

        let mimeType = file.type
        if (mimeType === 'image/png' && q < 1) {
            // PNG does not support quality setting in toBlob. 
            // If user wants compression, usually converting to JPEG or WebP is needed.
            // For this tool, let's allow converting PNG to WebP/JPEG if requested, but for now scaling is the main factor for PNG.
            // Or we force JPEG/WebP for compression.
            // Let's use the original type, but warn if PNG. 
            // ACTUALLY: consistent behavior -> 'image/webp' is good for web. 
            // But let's keep it simple: Use image/jpeg for compression if not PNG, or offer format conversion.
            // For now: maintain type, but if PNG, quality arg is ignored by spec (scaling still works).
        }

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    setCompressed({
                        file: new File([blob], file.name, { type: blob.type }),
                        preview: URL.createObjectURL(blob),
                        width: newWidth,
                        height: newHeight,
                        size: blob.size
                    })
                }
                setIsProcessing(false)
                console.log("Processed", blob?.size)
            },
            mimeType,
            q
        )
    }, [t])

    // Initial Load
    useEffect(() => {
        if (original?.file) {
            const timer = setTimeout(() => {
                processImage(original.file!, quality, scale)
            }, 300) // Debounce
            return () => clearTimeout(timer)
        }
    }, [quality, scale, original?.file, processImage])


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error(t('errorInvalidFile'))
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                setOriginal({
                    file,
                    preview: e.target?.result as string,
                    width: img.width,
                    height: img.height,
                    size: file.size
                })
                // Reset settings
                setQuality(0.8)
                setScale(1.0)
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    const download = () => {
        if (compressed?.preview) {
            const link = document.createElement("a");
            link.href = compressed.preview;
            link.download = `compressed_${original?.file?.name}`;
            link.click();
            toast.success(t('saved'));
        }
    }

    const clear = () => {
        setOriginal(null)
        setCompressed(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Upload Area */}
            {!original ? (
                <GlassCard
                    className="h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                    <div className="bg-primary/10 p-6 rounded-full mb-6 animate-pulse">
                        <Upload className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t('dropTitle')}</h3>
                    <p className="text-muted-foreground mb-6">{t('dropDesc')}</p>
                    <Button variant="secondary">{t('selectFile')}</Button>
                </GlassCard>
            ) : (
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    {/* Visualizer */}
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Original */}
                            <GlassCard className="p-4 relative group">
                                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                                    Original
                                </div>
                                <div className="aspect-square relative flex items-center justify-center bg-checkerboard rounded-lg overflow-hidden border border-border/10">
                                    {original.preview && (
                                        <img src={original.preview} alt="Original" className="max-w-full max-h-full object-contain" />
                                    )}
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Size</span>
                                        <span className="font-mono text-foreground">{formatBytes(original.size)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dimensions</span>
                                        <span className="font-mono text-foreground">{original.width} x {original.height}</span>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Compressed */}
                            <GlassCard className="p-4 relative group border-primary/50 ring-1 ring-primary/20">
                                <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                    Compressed
                                    {isProcessing && <RefreshCw className="w-3 h-3 animate-spin" />}
                                </div>
                                {compressed && original && (
                                    <div className="absolute top-4 right-4 z-10 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        -{Math.round((1 - compressed.size / original.size) * 100)}%
                                    </div>
                                )}
                                <div className="aspect-square relative flex items-center justify-center bg-checkerboard rounded-lg overflow-hidden border border-border/10">
                                    {compressed?.preview ? (
                                        <img src={compressed.preview} alt="Compressed" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full">
                                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Size</span>
                                        <span className="font-mono text-primary font-bold">{compressed ? formatBytes(compressed.size) : '...'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dimensions</span>
                                        <span className="font-mono text-foreground">{compressed?.width || '...'} x {compressed?.height || '...'}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 space-y-8 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <FileType className="w-4 h-4 text-primary" />
                                    {t('settings')}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quality Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <Label>{t('quality')}</Label>
                                    <span className="font-mono text-primary">{Math.round(quality * 100)}%</span>
                                </div>
                                <Slider
                                    value={[quality]}
                                    onValueChange={([v]) => setQuality(v)}
                                    min={0.1}
                                    max={1.0}
                                    step={0.05}
                                />
                                <p className="text-xs text-muted-foreground">Lower quality = smaller file size</p>
                            </div>

                            {/* Scale Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <Label>{t('resize')}</Label>
                                    <span className="font-mono text-primary">{Math.round(scale * 100)}%</span>
                                </div>
                                <Slider
                                    value={[scale]}
                                    onValueChange={([v]) => setScale(v)}
                                    min={0.1}
                                    max={1.0}
                                    step={0.1}
                                />
                                <p className="text-xs text-muted-foreground">Reduce dimensions to save more space</p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full font-bold gap-2"
                                onClick={download}
                                disabled={!compressed || isProcessing}
                            >
                                <Download className="w-4 h-4" />
                                {t('download')}
                            </Button>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    )
}
