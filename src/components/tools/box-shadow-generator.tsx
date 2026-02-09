"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { X, Plus, Copy, CheckCircle2, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ShadowLayer {
    id: string
    x: number
    y: number
    blur: number
    spread: number
    color: string
    inset: boolean
}

export function BoxShadowGenerator() {
    const t = useTranslations('BoxShadowGenerator')
    const [layers, setLayers] = useState<ShadowLayer[]>([
        { id: '1', x: 0, y: 4, blur: 10, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false },
        { id: '2', x: 0, y: 10, blur: 20, spread: -5, color: 'rgba(0,0,0,0.1)', inset: false }
    ])
    const [selectedLayerId, setSelectedLayerId] = useState<string>('1')
    const [boxColor, setBoxColor] = useState("#ffffff")
    const [bgColor, setBgColor] = useState("#f3f4f6")
    const [copied, setCopied] = useState(false)

    const selectedLayer = layers.find(l => l.id === selectedLayerId) || layers[0]

    const boxShadowCSS = useMemo(() => {
        return layers.map(l =>
            `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`
        ).join(', ')
    }, [layers])

    const updateLayer = (key: keyof ShadowLayer, value: any) => {
        setLayers(layers.map(l =>
            l.id === selectedLayerId ? { ...l, [key]: value } : l
        ))
    }

    const addLayer = () => {
        const newId = Date.now().toString()
        setLayers([...layers, { id: newId, x: 0, y: 10, blur: 20, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false }])
        setSelectedLayerId(newId)
    }

    const removeLayer = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (layers.length <= 1) return
        const newLayers = layers.filter(l => l.id !== id)
        setLayers(newLayers)
        if (selectedLayerId === id) {
            setSelectedLayerId(newLayers[newLayers.length - 1].id)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`box-shadow: ${boxShadowCSS};`)
        setCopied(true)
        toast.success(t('copied'))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Column: Controls */}
            <div className="space-y-6 order-2 lg:order-1">
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>{t('layers')}</span>
                            <Button size="sm" onClick={addLayer} variant="secondary" className="gap-2 h-8">
                                <Plus className="w-4 h-4" /> {t('addLayer')}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {layers.map((layer, index) => (
                                <div
                                    key={layer.id}
                                    onClick={() => setSelectedLayerId(layer.id)}
                                    className={cn(
                                        "relative group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm font-medium",
                                        selectedLayerId === layer.id
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted hover:bg-muted/80 border-transparent hover:border-border"
                                    )}
                                >
                                     <span>{t('layer', { index: index + 1 })}</span>
                                    {layers.length > 1 && (
                                        <button
                                            onClick={(e) => removeLayer(layer.id, e)}
                                            className={cn(
                                                "opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity",
                                                selectedLayerId === layer.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                            )}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-border/50 my-4" />

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label>{t('offsetX')}</Label>
                                        <span className="text-xs text-muted-foreground tabular-nums">{selectedLayer.x}px</span>
                                    </div>
                                    <Slider
                                        value={[selectedLayer.x]}
                                        min={-100} max={100}
                                        onValueChange={([val]) => updateLayer('x', val)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label>{t('offsetY')}</Label>
                                        <span className="text-xs text-muted-foreground tabular-nums">{selectedLayer.y}px</span>
                                    </div>
                                    <Slider
                                        value={[selectedLayer.y]}
                                        min={-100} max={100}
                                        onValueChange={([val]) => updateLayer('y', val)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                         <Label>{t('blurRadius')}</Label>
                                        <span className="text-xs text-muted-foreground tabular-nums">{selectedLayer.blur}px</span>
                                    </div>
                                    <Slider
                                        value={[selectedLayer.blur]}
                                        min={0} max={100}
                                        onValueChange={([val]) => updateLayer('blur', val)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                         <Label>{t('spreadRadius')}</Label>
                                        <span className="text-xs text-muted-foreground tabular-nums">{selectedLayer.spread}px</span>
                                    </div>
                                    <Slider
                                        value={[selectedLayer.spread]}
                                        min={-50} max={50}
                                        onValueChange={([val]) => updateLayer('spread', val)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-2">
                                    <Label>{t('color')}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            value={selectedLayer.color.startsWith('#') ? selectedLayer.color : '#000000'}
                                            onChange={(e) => updateLayer('color', e.target.value)}
                                            className="w-12 h-8 p-0 cursor-pointer"
                                        />
                                        <Input
                                            value={selectedLayer.color}
                                            onChange={(e) => updateLayer('color', e.target.value)}
                                            className="w-32 h-8 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="inset-mode" className="cursor-pointer">Inset</Label>
                                    <Switch
                                        id="inset-mode"
                                        checked={selectedLayer.inset}
                                        onCheckedChange={(val) => updateLayer('inset', val)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                        <Label>{t('boxColor')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={boxColor}
                                        onChange={(e) => setBoxColor(e.target.value)}
                                        className="w-10 h-9 p-0 cursor-pointer"
                                    />
                                    <Input
                                        value={boxColor}
                                        onChange={(e) => setBoxColor(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                        <Label>{t('backgroundColor')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-9 p-0 cursor-pointer"
                                    />
                                    <Input
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Preview & Code */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                <Card className="border-border shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center p-8 transition-colors duration-300" style={{ backgroundColor: bgColor }}>
                    <div
                        className="w-48 h-48 rounded-xl transition-all duration-300 flex items-center justify-center"
                        style={{
                            backgroundColor: boxColor,
                            boxShadow: boxShadowCSS
                        }}
                    >
                         <span className="text-sm font-medium text-muted-foreground/50 select-none">{t('preview')}</span>
                    </div>
                </Card>

                <Card className="border-border bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                        <CardTitle className="text-sm font-medium">{t('cssOutput')}</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={copyToClipboard}
                        >
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? t('copied') : t('copy')}
                        </Button>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto">
                            <code className="text-sm font-mono text-primary">
                                box-shadow: {boxShadowCSS};
                            </code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
