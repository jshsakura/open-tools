"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Copy,
    CheckCircle2,
    RefreshCcw,
    Palette,
    SunMedium,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    buildNeumorphism,
    type LightDirection,
    type NeumorphismShape,
} from "./neumorphism-generator.utils"

const DEFAULTS = {
    color: "#e0e5ec",
    size: 220,
    borderRadius: 50,
    distance: 20,
    intensity: 40,
}

const SHAPES: NeumorphismShape[] = ["flat", "concave", "convex", "pressed"]

const DIRECTIONS: LightDirection[] = [
    "top-left",
    "top-right",
    "bottom-right",
    "bottom-left",
]

export function NeumorphismGenerator() {
    const t = useTranslations("NeumorphismGenerator")

    const [color, setColor] = useState(DEFAULTS.color)
    const [size, setSize] = useState(DEFAULTS.size)
    const [borderRadius, setBorderRadius] = useState(DEFAULTS.borderRadius)
    const [distance, setDistance] = useState(DEFAULTS.distance)
    const [intensity, setIntensity] = useState(DEFAULTS.intensity)
    const [shape, setShape] = useState<NeumorphismShape>("flat")
    const [direction, setDirection] = useState<LightDirection>("top-left")
    const [copied, setCopied] = useState(false)

    const result = useMemo(
        () =>
            buildNeumorphism({
                color,
                size,
                borderRadius,
                distance,
                intensity,
                shape,
                direction,
            }),
        [color, size, borderRadius, distance, intensity, shape, direction]
    )

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.css)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    const reset = () => {
        setColor(DEFAULTS.color)
        setSize(DEFAULTS.size)
        setBorderRadius(DEFAULTS.borderRadius)
        setDistance(DEFAULTS.distance)
        setIntensity(DEFAULTS.intensity)
        setShape("flat")
        setDirection("top-left")
    }

    return (
        <div className="mx-auto max-w-5xl grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Controls */}
            <div className="space-y-6 order-2 lg:order-1">
                <GlassCard className="p-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            {t("settings")}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={reset}
                        >
                            <RefreshCcw className="h-3.5 w-3.5" />
                            {t("reset")}
                        </Button>
                    </div>

                    {/* Base color */}
                    <div className="space-y-3">
                        <Label className="text-sm">{t("baseColor")}</Label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                aria-label={t("baseColor")}
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-11 w-16 cursor-pointer rounded-xl border border-border/50 bg-background/50 overflow-hidden"
                            />
                            <Input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-11 font-mono"
                            />
                        </div>
                    </div>

                    {/* Size */}
                    <div className="space-y-3">
                        <Label className="flex justify-between text-sm">
                            {t("size")}
                            <span className="text-muted-foreground font-normal tabular-nums">
                                {size}px
                            </span>
                        </Label>
                        <Slider
                            value={[size]}
                            min={80}
                            max={400}
                            onValueChange={([v]) => setSize(v)}
                        />
                    </div>

                    {/* Border radius */}
                    <div className="space-y-3">
                        <Label className="flex justify-between text-sm">
                            {t("borderRadius")}
                            <span className="text-muted-foreground font-normal tabular-nums">
                                {borderRadius}px
                            </span>
                        </Label>
                        <Slider
                            value={[borderRadius]}
                            min={0}
                            max={150}
                            onValueChange={([v]) => setBorderRadius(v)}
                        />
                    </div>

                    {/* Distance */}
                    <div className="space-y-3">
                        <Label className="flex justify-between text-sm">
                            {t("distance")}
                            <span className="text-muted-foreground font-normal tabular-nums">
                                {distance}px
                            </span>
                        </Label>
                        <Slider
                            value={[distance]}
                            min={2}
                            max={60}
                            onValueChange={([v]) => setDistance(v)}
                        />
                    </div>

                    {/* Intensity / blur */}
                    <div className="space-y-3">
                        <Label className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <SunMedium className="h-3.5 w-3.5" />
                                {t("intensity")}
                            </span>
                            <span className="text-muted-foreground font-normal tabular-nums">
                                {intensity}px
                            </span>
                        </Label>
                        <Slider
                            value={[intensity]}
                            min={4}
                            max={120}
                            onValueChange={([v]) => setIntensity(v)}
                        />
                    </div>

                    {/* Light direction */}
                    <div className="space-y-3">
                        <Label className="text-sm">{t("lightSource")}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {DIRECTIONS.map((dir) => (
                                <Button
                                    key={dir}
                                    type="button"
                                    variant={direction === dir ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setDirection(dir)}
                                    className="h-9 text-xs"
                                >
                                    {t(`directions.${dir}`)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Shape */}
                    <div className="space-y-3">
                        <Label className="text-sm">{t("shape")}</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {SHAPES.map((sh) => (
                                <Button
                                    key={sh}
                                    type="button"
                                    variant={shape === sh ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShape(sh)}
                                    className="h-9 text-xs capitalize"
                                >
                                    {t(`shapes.${sh}`)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Preview + Output */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                <GlassCard
                    className="min-h-[420px] flex items-center justify-center p-8"
                    style={{ background: color }}
                >
                    <div
                        className="transition-all duration-300"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            maxWidth: "100%",
                            background: result.background,
                            borderRadius: `${borderRadius}px`,
                            boxShadow: result.boxShadow,
                        }}
                    />
                </GlassCard>

                <GlassCard className="overflow-hidden">
                    <div className="flex flex-row items-center justify-between px-5 py-3 border-b border-border/30">
                        <h4 className="text-sm font-medium">{t("output")}</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={copyToClipboard}
                        >
                            {copied ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                            {copied ? t("copied") : t("copy")}
                        </Button>
                    </div>
                    <div className="p-5">
                        <pre
                            className={cn(
                                "p-4 rounded-lg bg-background/60 border border-border/40 overflow-x-auto"
                            )}
                        >
                            <code className="text-sm font-mono text-primary whitespace-pre-wrap">
                                {result.css}
                            </code>
                        </pre>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
