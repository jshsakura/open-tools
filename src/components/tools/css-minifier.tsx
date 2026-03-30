"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Trash2, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function minifyCss(css: string): string {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove newlines and extra whitespace
        .replace(/\s+/g, " ")
        // Remove space around selectors and braces
        .replace(/\s*{\s*/g, "{")
        .replace(/\s*}\s*/g, "}")
        .replace(/\s*;\s*/g, ";")
        .replace(/\s*:\s*/g, ":")
        .replace(/\s*,\s*/g, ",")
        // Remove last semicolon before closing brace
        .replace(/;}/g, "}")
        .trim()
}

function beautifyCss(css: string): string {
    // First minify to normalize
    let result = css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .trim()

    let output = ""
    let indent = 0
    const indentStr = "  "

    for (let i = 0; i < result.length; i++) {
        const char = result[i]

        if (char === "{") {
            output += " {\n"
            indent++
            output += indentStr.repeat(indent)
        } else if (char === "}") {
            output = output.trimEnd()
            output += "\n"
            indent = Math.max(0, indent - 1)
            output += indentStr.repeat(indent) + "}\n"
            if (indent === 0) output += "\n"
            if (i + 1 < result.length && result[i + 1] !== "}") {
                output += indentStr.repeat(indent)
            }
        } else if (char === ";") {
            output += ";\n"
            if (i + 1 < result.length && result[i + 1] !== "}") {
                output += indentStr.repeat(indent)
            }
        } else {
            output += char
        }
    }

    return output.replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(2)} KB`
}

export function CssMinifierTool() {
    const t = useTranslations('CssMinifier')
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    const inputSize = useMemo(() => new Blob([input]).size, [input])
    const outputSize = useMemo(() => new Blob([output]).size, [output])
    const savings = useMemo(() => {
        if (inputSize === 0) return 0
        return Math.round(((inputSize - outputSize) / inputSize) * 100)
    }, [inputSize, outputSize])

    const handleMinify = useCallback(() => {
        if (!input.trim()) return
        setOutput(minifyCss(input))
    }, [input])

    const handleBeautify = useCallback(() => {
        if (!input.trim()) return
        setOutput(beautifyCss(input))
    }, [input])

    const copyToClipboard = useCallback((text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t('copied'))
        setTimeout(() => setCopied(false), 2000)
    }, [t])

    const handleClear = useCallback(() => {
        setInput("")
        setOutput("")
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
                <Button onClick={handleMinify} className="gap-2">
                    <Minimize2 className="h-4 w-4" />
                    {t('minify')}
                </Button>
                <Button onClick={handleBeautify} variant="secondary" className="gap-2">
                    <Maximize2 className="h-4 w-4" />
                    {t('beautify')}
                </Button>
                <Button onClick={handleClear} variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t('clear')}
                </Button>
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t('inputLabel')}</Label>
                        <span className="text-xs text-muted-foreground">
                            {formatBytes(inputSize)}
                        </span>
                    </div>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('inputPlaceholder')}
                        className="font-mono text-sm min-h-[400px] resize-y"
                    />
                </GlassCard>

                {/* Output Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t('outputLabel')}</Label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                {formatBytes(outputSize)}
                            </span>
                            {output && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1"
                                    onClick={() => copyToClipboard(output)}
                                >
                                    {copied
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        : <Copy className="h-3.5 w-3.5" />
                                    }
                                    {t('copy')}
                                </Button>
                            )}
                        </div>
                    </div>
                    <Textarea
                        value={output}
                        readOnly
                        placeholder={t('outputPlaceholder')}
                        className="font-mono text-sm min-h-[400px] resize-y"
                    />
                </GlassCard>
            </div>

            {/* Size Comparison */}
            {output && (
                <GlassCard className="p-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <div className="text-center">
                            <div className="text-muted-foreground">{t('originalSize')}</div>
                            <div className="font-mono font-semibold">{formatBytes(inputSize)}</div>
                        </div>
                        <div className="text-2xl text-muted-foreground">&rarr;</div>
                        <div className="text-center">
                            <div className="text-muted-foreground">{t('outputSize')}</div>
                            <div className="font-mono font-semibold">{formatBytes(outputSize)}</div>
                        </div>
                        <div className={cn(
                            "text-center px-3 py-1 rounded-full text-sm font-semibold",
                            savings > 0
                                ? "bg-green-500/10 text-green-600"
                                : savings < 0
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-muted text-muted-foreground"
                        )}>
                            {savings > 0 ? `-${savings}%` : savings < 0 ? `+${Math.abs(savings)}%` : `0%`}
                            {" "}{t('savings')}
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
