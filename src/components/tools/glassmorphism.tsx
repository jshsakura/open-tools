"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
    Sparkles,
    Copy,
    CheckCircle2,
    RefreshCcw,
    Layers,
    Palette,
    SunMedium
} from "lucide-react"
import { cn } from "@/lib/utils"

export function GlassmorphismTool() {
    const t = useTranslations('Glassmorphism')
    const [blur, setBlur] = useState([10])
    const [opacity, setOpacity] = useState([0.2])
    const [saturation, setSaturation] = useState([100])
    const [border, setBorder] = useState([0.1])
    const [color, setColor] = useState("#ffffff")
    const [copied, setCopied] = useState(false)

    // Convert hex to rgba for the CSS string
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const cssString = `/* Glassmorphism CSS */
background: ${hexToRgba(color, opacity[0])};
backdrop-filter: blur(${blur[0]}px) saturate(${saturation[0]}%);
-webkit-backdrop-filter: blur(${blur[0]}px) saturate(${saturation[0]}%);
border: 1px solid ${hexToRgba(color, border[0])};
border-radius: 20px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cssString)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Control Panel */}
                <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl shrink-0">
                    <CardHeader className="border-b border-border/10 bg-muted/30">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            {t('styleConfiguration')}
                        </CardTitle>
                        <CardDescription>{t('fineTune')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Blur */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="h-3 w-3" />
                                    Background Blur
                                </label>
                                <span className="text-xs font-black tabular-nums">{blur[0]}px</span>
                            </div>
                            <Slider value={blur} max={40} step={1} onValueChange={setBlur} className="cursor-pointer" />
                        </div>

                        {/* Opacity */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <SunMedium className="h-3 w-3" />
                                    Transparency
                                </label>
                                <span className="text-xs font-black tabular-nums">{Math.round(opacity[0] * 100)}%</span>
                            </div>
                            <Slider value={opacity} max={1} step={0.01} onValueChange={setOpacity} className="cursor-pointer" />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" />
                                    Saturation
                                </label>
                                <span className="text-xs font-black tabular-nums">{saturation[0]}%</span>
                            </div>
                            <Slider value={saturation} max={200} min={50} step={1} onValueChange={setSaturation} className="cursor-pointer" />
                        </div>

                        {/* Border Opacity */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="h-3 w-3" />
                                    Border Strength
                                </label>
                                <span className="text-xs font-black tabular-nums">{Math.round(border[0] * 100)}%</span>
                            </div>
                            <Slider value={border} max={1} step={0.01} onValueChange={setBorder} className="cursor-pointer" />
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Core Color</label>
                            <div className="flex gap-4">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-12 w-full cursor-pointer rounded-xl bg-background/50 border border-primary/10 overflow-hidden"
                                />
                                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => setColor("#ffffff")}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Panel */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center overflow-hidden h-[400px] flex items-center justify-center p-12 relative">
                        <div className="absolute inset-0 bg-black/20" />
                        <div
                            className="w-full h-full max-w-[300px] max-h-[200px] flex flex-col items-center justify-center p-8 transition-all duration-300"
                            style={{
                                background: hexToRgba(color, opacity[0]),
                                backdropFilter: `blur(${blur[0]}px) saturate(${saturation[0]}%)`,
                                WebkitBackdropFilter: `blur(${blur[0]}px) saturate(${saturation[0]}%)`,
                                border: `1px solid ${hexToRgba(color, border[0])}`,
                                borderRadius: "32px",
                                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                            }}
                        >
                            <h3 className="text-xl font-black tracking-tight text-white mb-2 drop-shadow-md">Glass Preview</h3>
                            <p className="text-xs text-white/80 text-center leading-relaxed drop-shadow-sm">This is how your interactive glass component will appear in your project.</p>
                        </div>
                    </Card>

                    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/10">
                            <h4 className="text-sm font-black tracking-tighter">Generated CSS Code</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                className="h-8 gap-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold"
                            >
                                {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? "Copied" : "Copy CSS"}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 bg-secondary/20">
                            <pre className="text-[12px] font-mono leading-relaxed text-muted-foreground/80 overflow-x-auto whitespace-pre-wrap">
                                {cssString}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
