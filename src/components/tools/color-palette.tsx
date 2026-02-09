"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ImageIcon,
    Palette,
    Copy,
    CheckCircle2,
    Upload,
    RefreshCcw,
    Sparkles,
    Trash2,
    Plus,
    Pipette
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorResult {
    hex: string
    percentage: number
}

export function ColorPaletteTool() {
    const t = useTranslations('ColorPalette')
    const [mode, setMode] = useState<'image' | 'manual'>('image')
    const [image, setImage] = useState<string | null>(null)
    const [palette, setPalette] = useState<ColorResult[]>([])
    const [extracting, setExtracting] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [manualColor, setManualColor] = useState("#3B82F6")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setImage(event.target?.result as string)
            extractPalette(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const extractPalette = (imgSrc: string) => {
        setExtracting(true)
        const img = new Image()
        img.src = imgSrc
        img.onload = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            // Resize for faster processing
            const size = 100
            canvas.width = size
            canvas.height = size
            ctx.drawImage(img, 0, 0, size, size)

            const imageData = ctx.getImageData(0, 0, size, size).data
            const colorCounts: Record<string, number> = {}

            // Simple quantization: round RGB values to reduce variance
            for (let i = 0; i < imageData.length; i += 4) {
                const r = Math.round(imageData[i] / 10) * 10
                const g = Math.round(imageData[i + 1] / 10) * 10
                const b = Math.round(imageData[i + 2] / 10) * 10
                const a = imageData[i + 3]

                if (a < 128) continue // Skip transparent

                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
                colorCounts[hex] = (colorCounts[hex] || 0) + 1
            }

            const sortedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([hex, count]) => ({
                    hex,
                    percentage: Math.round((count / (size * size)) * 100)
                }))

            setPalette(sortedColors)
            setExtracting(false)
        }
    }

    const addManualColor = () => {
        if (palette.some(c => c.hex.toLowerCase() === manualColor.toLowerCase())) {
            return // Already exists
        }
        setPalette([...palette, { hex: manualColor, percentage: 0 }])
    }

    const removeColor = (index: number) => {
        setPalette(palette.filter((_, i) => i !== index))
    }

    const copyColor = (hex: string, index: number) => {
        navigator.clipboard.writeText(hex)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const clear = () => {
        setImage(null)
        setPalette([])
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-secondary/30 rounded-[20px] border border-border/10">
                <Button
                    variant={mode === 'image' ? 'default' : 'ghost'}
                    className={cn(
                        "flex-1 rounded-[16px] gap-2 font-bold transition-all",
                        mode === 'image' && "shadow-lg"
                    )}
                    onClick={() => setMode('image')}
                >
                    <ImageIcon className="h-4 w-4" />
                    Extract from Image
                </Button>
                <Button
                    variant={mode === 'manual' ? 'default' : 'ghost'}
                    className={cn(
                        "flex-1 rounded-[16px] gap-2 font-bold transition-all",
                        mode === 'manual' && "shadow-lg"
                    )}
                    onClick={() => setMode('manual')}
                >
                    <Pipette className="h-4 w-4" />
                    Manual Color Picker
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Upload & Preview / Manual Picker */}
                <Card className="lg:col-span-1 border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    {mode === 'image' ? (
                        image ? (
                            <div className="w-full space-y-4 relative z-10">
                                <div className="relative aspect-square rounded-[32px] overflow-hidden border border-border/20 shadow-2xl">
                                    <img src={image} alt="Target" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="rounded-full" onClick={clear}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest italic">Image Analysis Complete</p>
                            </div>
                        ) : (
                            <div
                                className="w-full aspect-square rounded-[32px] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-8 space-y-4 cursor-pointer hover:border-primary/40 hover:bg-primary/10 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="p-5 rounded-3xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Upload className="h-10 w-10" />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-lg">Drop Image Here</h4>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP up to 5MB</p>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                            </div>
                        )
                    ) : (
                        <div className="w-full space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pick a Color</label>
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={manualColor}
                                        onChange={(e) => setManualColor(e.target.value)}
                                        className="w-full h-32 rounded-[24px] cursor-pointer border-2 border-border/20"
                                    />
                                </div>
                                <Input
                                    value={manualColor}
                                    onChange={(e) => setManualColor(e.target.value)}
                                    placeholder="#3B82F6"
                                    className="font-mono text-center"
                                />
                            </div>
                            <Button
                                onClick={addManualColor}
                                className="w-full rounded-[16px] gap-2 font-bold"
                                size="lg"
                            >
                                <Plus className="h-4 w-4" />
                                Add to Palette
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Palette Results */}
                <Card className="lg:col-span-2 border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border/10 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-pink-500" />
                                    {mode === 'image' ? 'Extracted Palette' : 'Your Color Palette'}
                                </CardTitle>
                                <CardDescription>
                                    {mode === 'image' ? 'Detected prominent colors and ratios' : 'Click colors to copy hex codes'}
                                </CardDescription>
                            </div>
                            {extracting && <RefreshCcw className="h-5 w-5 animate-spin text-primary" />}
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1">
                        {palette.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                {palette.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="group cursor-pointer space-y-3 relative"
                                    >
                                        <div
                                            className="aspect-square rounded-[24px] border border-black/10 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3 group-active:scale-95 flex items-center justify-center relative"
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => copyColor(color.hex, idx)}
                                        >
                                            {copiedIndex === idx && (
                                                <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white animate-in zoom-in duration-300">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                            )}
                                            {mode === 'manual' && (
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeColor(idx)
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="text-center space-y-0.5">
                                            <p className="text-[11px] font-black tracking-tight font-mono text-foreground">{color.hex.toUpperCase()}</p>
                                            {mode === 'image' && color.percentage > 0 && (
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{color.percentage}%</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 space-y-6 text-center">
                                <div className="p-8 rounded-full bg-secondary animate-pulse">
                                    <Sparkles className="h-16 w-16 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black tracking-tight">
                                        {mode === 'image' ? 'Waiting for Image' : 'Start Adding Colors'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {mode === 'image'
                                            ? 'The generated palette will appear here instantly after upload.'
                                            : 'Pick colors and add them to build your custom palette.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Hint - Simplified without left accent */}
            <div className="flex items-center gap-3 p-6 rounded-[24px] bg-secondary/20 border border-border/10">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Palette className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Privacy First:</strong> All color extraction happens locally in your browser using the Canvas API. No data is sent to any server.
                </p>
            </div>
        </div>
    )
}
