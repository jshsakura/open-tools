"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, RotateCcw, Plus, X, ArrowRight, ArrowDown, ArrowUp, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type GradientType = 'linear' | 'radial' | 'conic'

interface ColorStop {
    id: string
    color: string
    position: number
}

export function CssGradientGenerator() {
    const t = useTranslations('GradientGenerator')
    const [type, setType] = useState<GradientType>('linear')
    const [angle, setAngle] = useState(90)
    const [stops, setStops] = useState<ColorStop[]>([
        { id: '1', color: '#ff0080', position: 0 },
        { id: '2', color: '#7928ca', position: 100 }
    ])
    const [copied, setCopied] = useState(false)
    const [activeStopId, setActiveStopId] = useState<string>('1')

    const activeStop = stops.find(s => s.id === activeStopId) || stops[0]

    // Sort stops by position for the gradient string
    const sortedStops = useMemo(() => {
        return [...stops].sort((a, b) => a.position - b.position)
    }, [stops])

    const gradientCSS = useMemo(() => {
        const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')

        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${stopsStr})`
        } else if (type === 'radial') {
            return `radial-gradient(circle, ${stopsStr})`
        } else {
            return `conic-gradient(from ${angle}deg, ${stopsStr})`
        }
    }, [type, angle, sortedStops])

    const addStop = () => {
        const newId = Date.now().toString()
        // Add a stop in the middle or after the last one
        const newPosition = 50
        setStops([...stops, { id: newId, color: '#00ffff', position: newPosition }])
        setActiveStopId(newId)
    }

    const removeStop = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (stops.length <= 2) {
            toast.error(t('minStopsError'))
            return
        }
        const newStops = stops.filter(s => s.id !== id)
        setStops(newStops)
        if (activeStopId === id) {
            setActiveStopId(newStops[0].id)
        }
    }

    const updateStop = (id: string, key: keyof ColorStop, value: any) => {
        setStops(stops.map(s => s.id === id ? { ...s, [key]: value } : s))
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`background: ${gradientCSS};`)
        setCopied(true)
        toast.success(t('copied'))
        setTimeout(() => setCopied(false), 2000)
    }

    const randomize = () => {
        const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        setStops(stops.map(s => ({ ...s, color: randomColor() })))
        setAngle(Math.floor(Math.random() * 360))
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left: Controls */}
            <div className="space-y-6 order-2 lg:order-1">
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">{t('settings')}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={randomize} title={t('randomize')}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {t('randomize')}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Type & Angle */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('type')}</Label>
                                <Select value={type} onValueChange={(v: GradientType) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="linear">Linear</SelectItem>
                                        <SelectItem value="radial">Radial</SelectItem>
                                        <SelectItem value="conic">Conic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {type !== 'radial' && (
                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        {t('angle')} <span className="text-muted-foreground font-normal">{angle}°</span>
                                    </Label>
                                    <Slider
                                        value={[angle]}
                                        min={0} max={360}
                                        onValueChange={([v]) => setAngle(v)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Color Stops Visualizer */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>{t('colors')}</Label>
                                <Button size="sm" variant="secondary" onClick={addStop} className="h-7 text-xs gap-1">
                                    <Plus className="w-3 h-3" /> {t('addStop')}
                                </Button>
                            </div>

                            {/* Gradient Bar Slider */}
                            <div className="relative h-6 rounded-full w-full cursor-pointer shadow-inner border border-border/50"
                                style={{ background: `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})` }}>
                                {stops.map(stop => (
                                    <div
                                        key={stop.id}
                                        className={cn(
                                            "absolute top-0 w-4 h-full -ml-2 border-2 border-white rounded-full shadow-md hover:scale-110 transition-transform cursor-grab active:cursor-grabbing",
                                            activeStopId === stop.id ? "ring-2 ring-primary ring-offset-1 scale-110" : ""
                                        )}
                                        style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActiveStopId(stop.id)
                                        }}
                                        onMouseDown={(e) => {
                                            // Simple drag implementation could go here, but using sliders below for precision
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Active Stop Controls */}
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <Label>{t('color')}</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="color"
                                                value={activeStop.color}
                                                onChange={(e) => updateStop(activeStop.id, 'color', e.target.value)}
                                                className="w-10 h-9 p-0 cursor-pointer shrink-0"
                                            />
                                            <Input
                                                value={activeStop.color}
                                                onChange={(e) => updateStop(activeStop.id, 'color', e.target.value)}
                                                className="font-mono text-xs uppercase"
                                                maxLength={9}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <Label className="flex justify-between">
                                            {t('position')} <span className="text-muted-foreground font-normal">{activeStop.position}%</span>
                                        </Label>
                                        <Slider
                                            value={[activeStop.position]}
                                            min={0} max={100}
                                            onValueChange={([v]) => updateStop(activeStop.id, 'position', v)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mt-6 hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => removeStop(activeStop.id, e)}
                                        disabled={stops.length <= 2}
                                        title={t('removeStop')}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Preview */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                <Card className="border-border shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center p-0 relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    <div
                        className="w-full h-full absolute inset-0 transition-all duration-500"
                        style={{ background: gradientCSS }}
                    />
                </Card>

                <Card className="border-border bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                        <CardTitle className="text-sm font-medium">CSS Output</CardTitle>
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
                                background: {gradientCSS};
                            </code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
