"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Copy, RefreshCw, Layers } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

type PatternType = 'dots' | 'grid' | 'stripes' | 'waves'

export function CssPattern() {
    const t = useTranslations('CssPattern');
    const [type, setType] = useState<PatternType>('dots')
    const [color1, setColor1] = useState("#3b82f6")
    const [color2, setColor2] = useState("#ffffff")
    const [opacity, setOpacity] = useState(0.2)
    const [spacing, setSpacing] = useState(20)
    const [size, setSize] = useState(2)

    const getPatternCss = () => {
        const rgba1 = hexToRgba(color1, opacity)
        switch (type) {
            case 'dots':
                return `background-color: ${color2};\nbackground-image: radial-gradient(${rgba1} ${size}px, transparent ${size}px);\nbackground-size: ${spacing}px ${spacing}px;`
            case 'grid':
                return `background-color: ${color2};\nbackground-image: linear-gradient(${rgba1} 1px, transparent 1px), linear-gradient(90deg, ${rgba1} 1px, transparent 1px);\nbackground-size: ${spacing}px ${spacing}px;`
            case 'stripes':
                return `background-color: ${color2};\nbackground-image: linear-gradient(45deg, ${rgba1} 25%, transparent 25%, transparent 50%, ${rgba1} 50%, ${rgba1} 75%, transparent 75%, transparent);\nbackground-size: ${spacing}px ${spacing}px;`
            case 'waves':
                return `background-color: ${color2};\nbackground-image: radial-gradient(circle at 100% 150%, ${color2} 24%, ${rgba1} 25%, ${rgba1} 28%, ${color2} 29%, ${color2} 36%, ${rgba1} 36%, ${rgba1} 40%, transparent 40%, transparent);\nbackground-size: ${spacing}px ${spacing}px;`
            default:
                return ""
        }
    }

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const copyCss = () => {
        navigator.clipboard.writeText(getPatternCss())
        toast.success(t('copyCss'))
    }

    return (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-8">
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">{t('patternType')}</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['dots', 'grid', 'stripes', 'waves'] as PatternType[]).map((p) => (
                            <Button
                                key={p}
                                variant={type === p ? 'default' : 'outline'}
                                onClick={() => setType(p)}
                                className="capitalize"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label>{t('colors')} 1</Label>
                        <div className="flex gap-2">
                            <Input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-10 p-1" />
                            <Input type="text" value={color1} onChange={(e) => setColor1(e.target.value)} className="font-mono" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label>{t('colors')} 2</Label>
                        <div className="flex gap-2">
                            <Input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-10 p-1" />
                            <Input type="text" value={color2} onChange={(e) => setColor2(e.target.value)} className="font-mono" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>{t('opacity')}</Label>
                            <span className="text-sm font-mono">{Math.round(opacity * 100)}%</span>
                        </div>
                        <Slider value={[opacity]} min={0} max={1} step={0.01} onValueChange={([v]) => setOpacity(v)} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>{t('spacing')}</Label>
                            <span className="text-sm font-mono">{spacing}px</span>
                        </div>
                        <Slider value={[spacing]} min={5} max={100} step={1} onValueChange={([v]) => setSpacing(v)} />
                    </div>

                    {type === 'dots' && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Dot Size</Label>
                                <span className="text-sm font-mono">{size}px</span>
                            </div>
                            <Slider value={[size]} min={1} max={10} step={0.5} onValueChange={([v]) => setSize(v)} />
                        </div>
                    )}
                </div>

                <Button className="w-full h-12 text-lg font-bold" onClick={copyCss}>
                    <Copy className="w-5 h-5 mr-2" />
                    {t('copyCss')}
                </Button>
            </GlassCard>

            <div className="space-y-6">
                <div 
                    className="w-full aspect-square rounded-2xl border-2 border-border/40 shadow-inner transition-all duration-300"
                    style={{
                        backgroundColor: color2,
                        backgroundImage: getPatternCss().split('background-image: ')[1]?.split(';')[0],
                        backgroundSize: getPatternCss().split('background-size: ')[1]?.split(';')[0]
                    }}
                />
                <GlassCard className="p-4 bg-muted/30">
                    <pre className="text-xs font-mono overflow-x-auto p-2">
                        {getPatternCss()}
                    </pre>
                </GlassCard>
            </div>
        </div>
    )
}
