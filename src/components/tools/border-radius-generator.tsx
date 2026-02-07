"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Maximize, Minimize } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function BorderRadiusGenerator() {
    const t = useTranslations('BorderRadiusGenerator')

    // Top-Left, Top-Right, Bottom-Right, Bottom-Left
    const [tl, setTl] = useState(30)
    const [tr, setTr] = useState(30)
    const [br, setBr] = useState(30)
    const [bl, setBl] = useState(30)

    // For 8-point (fancy) border radius: horizontal / vertical
    const [isAdvanced, setIsAdvanced] = useState(false)

    // Additional vertical values for advanced mode
    // Top-Left-Y, Top-Right-Y, Bottom-Right-Y, Bottom-Left-Y
    const [tlY, setTlY] = useState(30)
    const [trY, setTrY] = useState(30)
    const [brY, setBrY] = useState(30)
    const [blY, setBlY] = useState(30)

    const [copied, setCopied] = useState(false)
    const [width, setWidth] = useState(300)
    const [height, setHeight] = useState(300)

    const borderRadiusCSS = useMemo(() => {
        if (!isAdvanced) {
            return `${tl}px ${tr}px ${br}px ${bl}px`
        } else {
            return `${tl}% ${tr}% ${br}% ${bl}% / ${tlY}% ${trY}% ${brY}% ${blY}%`
        }
    }, [tl, tr, br, bl, isAdvanced, tlY, trY, brY, blY])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`border-radius: ${borderRadiusCSS};`)
        setCopied(true)
        toast.success(t('copied'))
        setTimeout(() => setCopied(false), 2000)
    }

    const reset = () => {
        setTl(30); setTr(30); setBr(30); setBl(30);
        setTlY(30); setTrY(30); setBrY(30); setBlY(30);
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left: Controls */}
            <div className="space-y-6 order-2 lg:order-1">
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">{t('settings')}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="advanced-mode" className="text-sm cursor-pointer">{t('advancedMode')}</Label>
                            <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* 4 Corners Control */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            {/* Top Left */}
                            <div className="space-y-3">
                                <Label className="flex justify-between">
                                    {t('topLeft')} <span className="text-muted-foreground font-normal tabular-nums">{tl}{isAdvanced ? '%' : 'px'}</span>
                                </Label>
                                <Slider
                                    value={[tl]}
                                    min={0} max={isAdvanced ? 100 : 150}
                                    onValueChange={([v]) => setTl(v)}
                                />
                                {isAdvanced && (
                                    <Slider
                                        className="mt-2 opacity-70"
                                        value={[tlY]}
                                        min={0} max={100}
                                        onValueChange={([v]) => setTlY(v)}
                                    />
                                )}
                            </div>

                            {/* Top Right */}
                            <div className="space-y-3">
                                <Label className="flex justify-between">
                                    {t('topRight')} <span className="text-muted-foreground font-normal tabular-nums">{tr}{isAdvanced ? '%' : 'px'}</span>
                                </Label>
                                <Slider
                                    value={[tr]}
                                    min={0} max={isAdvanced ? 100 : 150}
                                    onValueChange={([v]) => setTr(v)}
                                />
                                {isAdvanced && (
                                    <Slider
                                        className="mt-2 opacity-70"
                                        value={[trY]}
                                        min={0} max={100}
                                        onValueChange={([v]) => setTrY(v)}
                                    />
                                )}
                            </div>

                            {/* Bottom Left */}
                            <div className="space-y-3">
                                <Label className="flex justify-between">
                                    {t('bottomLeft')} <span className="text-muted-foreground font-normal tabular-nums">{bl}{isAdvanced ? '%' : 'px'}</span>
                                </Label>
                                <Slider
                                    value={[bl]}
                                    min={0} max={isAdvanced ? 100 : 150}
                                    onValueChange={([v]) => setBl(v)}
                                />
                                {isAdvanced && (
                                    <Slider
                                        className="mt-2 opacity-70"
                                        value={[blY]}
                                        min={0} max={100}
                                        onValueChange={([v]) => setBlY(v)}
                                    />
                                )}
                            </div>

                            {/* Bottom Right */}
                            <div className="space-y-3">
                                <Label className="flex justify-between">
                                    {t('bottomRight')} <span className="text-muted-foreground font-normal tabular-nums">{br}{isAdvanced ? '%' : 'px'}</span>
                                </Label>
                                <Slider
                                    value={[br]}
                                    min={0} max={isAdvanced ? 100 : 150}
                                    onValueChange={([v]) => setBr(v)}
                                />
                                {isAdvanced && (
                                    <Slider
                                        className="mt-2 opacity-70"
                                        value={[brY]}
                                        min={0} max={100}
                                        onValueChange={([v]) => setBrY(v)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-4">
                            <Label>{t('boxSize')}</Label>
                            <div className="flex gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Width: {width}px</Label>
                                    <Slider value={[width]} min={50} max={500} onValueChange={([v]) => setWidth(v)} />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-xs text-muted-foreground">Height: {height}px</Label>
                                    <Slider value={[height]} min={50} max={500} onValueChange={([v]) => setHeight(v)} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Preview */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                <Card className="border-border shadow-sm overflow-hidden min-h-[500px] flex items-center justify-center p-8 bg-muted/20 relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                    <div
                        className={cn(
                            "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl transition-all duration-300 relative group flex items-center justify-center",
                            "before:absolute before:inset-0 before:border-2 before:border-dashed before:border-white/30 before:rounded-[inherit] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
                        )}
                        style={{
                            borderRadius: borderRadiusCSS,
                            width: `${width}px`,
                            height: `${height}px`
                        }}
                    >
                        <div className="text-white/90 text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Preview
                        </div>
                    </div>
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
                                border-radius: {borderRadiusCSS};
                            </code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
