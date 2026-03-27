"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Palette, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Pure TS Conversion Functions ────────────────────────────────────────────

function clamp(value: number, min = 0, max = 255): number {
    return Math.max(min, Math.min(max, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const clean = hex.replace(/^#/, "").trim()
    const full =
        clean.length === 3
            ? clean.split("").map((c) => c + c).join("")
            : clean
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
    }
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0")).join("").toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const delta = max - min
    let h = 0, s = 0
    const l = (max + min) / 2
    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1))
        switch (max) {
            case rn: h = (((gn - bn) / delta) % 6); break
            case gn: h = (bn - rn) / delta + 2; break
            case bn: h = (rn - gn) / delta + 4; break
        }
        h = Math.round(h * 60)
        if (h < 0) h += 360
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const sn = s / 100, ln = l / 100
    const c = (1 - Math.abs(2 * ln - 1)) * sn
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = ln - c / 2
    let rn = 0, gn = 0, bn = 0
    if (h < 60) { rn = c; gn = x; bn = 0 }
    else if (h < 120) { rn = x; gn = c; bn = 0 }
    else if (h < 180) { rn = 0; gn = c; bn = x }
    else if (h < 240) { rn = 0; gn = x; bn = c }
    else if (h < 300) { rn = x; gn = 0; bn = c }
    else { rn = c; gn = 0; bn = x }
    return {
        r: Math.round((rn + m) * 255),
        g: Math.round((gn + m) * 255),
        b: Math.round((bn + m) * 255),
    }
}

function parseColor(input: string): { r: number; g: number; b: number } | null {
    const trimmed = input.trim()
    // HEX
    if (/^#?[0-9a-f]{3,6}$/i.test(trimmed)) {
        return hexToRgb(trimmed.startsWith("#") ? trimmed : "#" + trimmed)
    }
    // RGB
    const rgbMatch = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i)
    if (rgbMatch) {
        return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
    }
    // HSL
    const hslMatch = trimmed.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*(?:,\s*[\d.]+\s*)?\)$/i)
    if (hslMatch) {
        return hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]))
    }
    return null
}

function getLuminance(r: number, g: number, b: number): number {
    const toLinear = (c: number) => {
        const n = c / 255
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function getTextColor(r: number, g: number, b: number): string {
    return getLuminance(r, g, b) > 0.179 ? "#1a1a1a" : "#ffffff"
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_HEX = "#3B82F6"
const DEFAULT_RGB = hexToRgb(DEFAULT_HEX)!

export function ColorConverterTool() {
    const t = useTranslations('ColorConverter')
    const [hexInput, setHexInput] = useState(DEFAULT_HEX)
    const [colorRgb, setColorRgb] = useState(DEFAULT_RGB)
    const [isValid, setIsValid] = useState(true)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const hex = rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b)
    const hsl = rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b)
    const hexStr = hex
    const rgbStr = `rgb(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b})`
    const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    const textColor = getTextColor(colorRgb.r, colorRgb.g, colorRgb.b)
    const previewBg = isValid ? hex : "#cccccc"

    const applyRgb = useCallback((rgb: { r: number; g: number; b: number }) => {
        const h = rgbToHex(rgb.r, rgb.g, rgb.b)
        setHexInput(h)
        setColorRgb(rgb)
        setIsValid(true)
    }, [])

    const handleInputChange = (val: string) => {
        setHexInput(val)
        const parsed = parseColor(val)
        if (parsed) {
            setColorRgb(parsed)
            setIsValid(true)
        } else {
            setIsValid(false)
        }
    }

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const h = e.target.value
        const rgb = hexToRgb(h)
        if (!rgb) return
        setHexInput(h.toUpperCase())
        setColorRgb(rgb)
        setIsValid(true)
    }

    const copyToClipboard = useCallback((text: string, field: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(t('copied'))
        setTimeout(() => setCopiedField(null), 2000)
    }, [t])

    // Complementary color
    const compHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }
    const compRgb = hslToRgb(compHsl.h, compHsl.s, compHsl.l)
    const compHex = rgbToHex(compRgb.r, compRgb.g, compRgb.b)

    // Analogous colors
    const analogous = [
        { h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l },
        { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l },
    ].map(c => {
        const rgb = hslToRgb(c.h, c.s, c.l)
        return rgbToHex(rgb.r, rgb.g, rgb.b)
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Input Section */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Color Picker + Preview */}
                <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                    <div className="border-b border-border/10 bg-muted/30 p-4">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <Palette className="h-4 w-4 text-pink-500" />
                            {t('picker')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Large preview swatch */}
                        <div
                            className="relative w-full rounded-2xl overflow-hidden shadow-lg transition-colors duration-200"
                            style={{ backgroundColor: previewBg, height: "140px" }}
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                <span className="text-2xl font-black tracking-tighter font-mono" style={{ color: textColor }}>
                                    {isValid ? hex : "---"}
                                </span>
                                <span className="text-xs font-bold opacity-70" style={{ color: textColor }}>
                                    {isValid ? rgbStr : t('invalid')}
                                </span>
                            </div>
                        </div>

                        {/* Native color picker */}
                        <input
                            type="color"
                            value={isValid ? hex.toLowerCase() : "#000000"}
                            onChange={handlePickerChange}
                            className="w-full h-12 rounded-xl cursor-pointer border border-border/30 bg-transparent p-1"
                        />

                        {/* Text input */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t('inputLabel')}
                            </Label>
                            <div className="relative">
                                <Input
                                    value={hexInput}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder={t('inputPlaceholder')}
                                    className={cn(
                                        "font-mono text-center font-bold pr-8 transition-colors",
                                        !isValid && hexInput.length > 1 && "border-red-400 focus-visible:ring-red-400"
                                    )}
                                />
                                {!isValid && hexInput.length > 1 && (
                                    <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                                )}
                            </div>
                            {!isValid && hexInput.length > 1 && (
                                <p className="text-[10px] text-red-400 font-medium">{t('invalid')}</p>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* RGB Sliders */}
                <GlassCard className="lg:col-span-3 p-0 overflow-hidden">
                    <div className="border-b border-border/10 bg-muted/30 p-4">
                        <h3 className="text-base font-bold">{t('rgbChannels')}</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {([
                            { key: "r" as const, label: t('red'), color: "#ef4444" },
                            { key: "g" as const, label: t('green'), color: "#22c55e" },
                            { key: "b" as const, label: t('blue'), color: "#3b82f6" },
                        ]).map(({ key, label, color }) => (
                            <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        {label}
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={255}
                                        value={colorRgb[key]}
                                        onChange={(e) => {
                                            const val = clamp(Number(e.target.value))
                                            applyRgb({ ...colorRgb, [key]: val })
                                        }}
                                        className="h-7 w-16 text-center text-xs font-mono font-bold p-1"
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={255}
                                    value={colorRgb[key]}
                                    onChange={(e) => applyRgb({ ...colorRgb, [key]: Number(e.target.value) })}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: (() => {
                                            const s = { ...colorRgb, [key]: 0 }
                                            const end = { ...colorRgb, [key]: 255 }
                                            return `linear-gradient(to right, rgb(${s.r},${s.g},${s.b}), rgb(${end.r},${end.g},${end.b}))`
                                        })(),
                                        accentColor: color,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Conversion Results */}
            <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">
                    {t('conversionResults')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: "HEX", value: hexStr, field: "hex" },
                        { label: "RGB", value: rgbStr, field: "rgb" },
                        { label: "HSL", value: hslStr, field: "hsl" },
                    ].map(({ label, value, field }) => (
                        <GlassCard key={field} className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => copyToClipboard(value, field)}
                                >
                                    {copiedField === field
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        : <Copy className="h-3.5 w-3.5" />
                                    }
                                </Button>
                            </div>
                            <p className="font-mono text-sm font-bold">{value}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Related Colors */}
            {isValid && (
                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">
                        {t('relatedColors')}
                    </h3>
                    <GlassCard className="p-6">
                        <div className="space-y-4">
                            {/* Complementary */}
                            <div>
                                <Label className="text-xs font-semibold mb-2 block">{t('complementary')}</Label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: compHex }} />
                                    <span className="font-mono text-sm">{compHex}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(compHex, "comp")}>
                                        {copiedField === "comp" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                            {/* Analogous */}
                            <div>
                                <Label className="text-xs font-semibold mb-2 block">{t('analogous')}</Label>
                                <div className="flex flex-wrap gap-3">
                                    {analogous.map((hexVal, i) => {
                                        const key = `analog-${i}`
                                        return (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: hexVal }} />
                                                <span className="font-mono text-sm">{hexVal}</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(hexVal, key)}>
                                                    {copiedField === key ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}
