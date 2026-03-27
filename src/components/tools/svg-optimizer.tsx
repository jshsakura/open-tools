"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Download,
    Copy,
    CheckCircle2,
    Trash2,
    Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OptimizationOptions {
    removeComments: boolean
    removeEmptyAttrs: boolean
    removeMetadata: boolean
    minify: boolean
    removeDefaults: boolean
    shortHex: boolean
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function optimizeSvg(svg: string, opts: OptimizationOptions): string {
    let result = svg

    if (opts.removeComments) {
        result = result.replace(/<!--[\s\S]*?-->/g, "")
    }

    if (opts.removeMetadata) {
        result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
        result = result.replace(/<title[\s\S]*?<\/title>/gi, "")
        result = result.replace(/<desc[\s\S]*?<\/desc>/gi, "")
        // Remove XML processing instructions
        result = result.replace(/<\?xml[\s\S]*?\?>/gi, "")
        // Remove DOCTYPE
        result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    }

    if (opts.removeEmptyAttrs) {
        result = result.replace(/\s+[a-zA-Z-]+=""\s*/g, " ")
        result = result.replace(/\s+[a-zA-Z-]+=''s*/g, " ")
    }

    if (opts.removeDefaults) {
        // Remove common default values
        result = result.replace(/\s+fill-opacity="1"/g, "")
        result = result.replace(/\s+stroke-opacity="1"/g, "")
        result = result.replace(/\s+opacity="1"/g, "")
        result = result.replace(/\s+fill-rule="nonzero"/g, "")
        result = result.replace(/\s+clip-rule="nonzero"/g, "")
        result = result.replace(/\s+stroke="none"/g, "")
        result = result.replace(/\s+stroke-width="1"/g, "")
        result = result.replace(/\s+stroke-linecap="butt"/g, "")
        result = result.replace(/\s+stroke-linejoin="miter"/g, "")
        result = result.replace(/\s+stroke-dasharray="none"/g, "")
        result = result.replace(/\s+stroke-dashoffset="0"/g, "")
        result = result.replace(/\s+font-weight="normal"/g, "")
        result = result.replace(/\s+font-style="normal"/g, "")
        result = result.replace(/\s+display="inline"/g, "")
        result = result.replace(/\s+visibility="visible"/g, "")
        result = result.replace(/\s+overflow="visible"/g, "")
    }

    if (opts.shortHex) {
        // Convert 6-char hex to 3-char where possible (e.g., #FF0000 -> #F00)
        result = result.replace(/#([0-9A-Fa-f])\1([0-9A-Fa-f])\2([0-9A-Fa-f])\3/g, "#$1$2$3")
        // Convert common named colors to hex
        const colorMap: Record<string, string> = {
            white: "#fff",
            black: "#000",
            red: "#f00",
            blue: "#00f",
            green: "#008000",
            yellow: "#ff0",
            cyan: "#0ff",
            magenta: "#f0f",
        }
        for (const [name, hex] of Object.entries(colorMap)) {
            const regex = new RegExp(`(fill|stroke|color|stop-color)="${name}"`, "gi")
            result = result.replace(regex, `$1="${hex}"`)
        }
    }

    if (opts.minify) {
        // Collapse whitespace between tags
        result = result.replace(/>\s+</g, "><")
        // Collapse multiple spaces in attributes
        result = result.replace(/\s{2,}/g, " ")
        // Remove leading/trailing whitespace per line
        result = result.split("\n").map((l) => l.trim()).filter(Boolean).join("")
    }

    // Final cleanup: remove empty lines
    result = result.replace(/^\s*[\r\n]/gm, "")

    return result.trim()
}

export function SvgOptimizerTool() {
    const t = useTranslations("SvgOptimizer")

    const [inputSvg, setInputSvg] = useState("")
    const [copied, setCopied] = useState(false)
    const [options, setOptions] = useState<OptimizationOptions>({
        removeComments: true,
        removeEmptyAttrs: true,
        removeMetadata: true,
        minify: true,
        removeDefaults: true,
        shortHex: true,
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    const optimizedSvg = useMemo(() => {
        if (!inputSvg.trim()) return ""
        return optimizeSvg(inputSvg, options)
    }, [inputSvg, options])

    const originalSize = useMemo(() => new Blob([inputSvg]).size, [inputSvg])
    const optimizedSize = useMemo(() => new Blob([optimizedSvg]).size, [optimizedSvg])
    const savings = originalSize > 0 ? ((1 - optimizedSize / originalSize) * 100).toFixed(1) : "0"

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            if (text) setInputSvg(text)
        }
        reader.readAsText(f)
    }, [])

    const handleCopy = useCallback(() => {
        if (!optimizedSvg) return
        navigator.clipboard.writeText(optimizedSvg)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }, [optimizedSvg, t])

    const handleDownload = useCallback(() => {
        if (!optimizedSvg) return
        const blob = new Blob([optimizedSvg], { type: "image/svg+xml" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "optimized.svg"
        a.click()
        toast.success(t("downloaded"))
    }, [optimizedSvg, t])

    const handleClear = useCallback(() => {
        setInputSvg("")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [])

    const toggleOption = useCallback((key: keyof OptimizationOptions) => {
        setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
    }, [])

    const optionItems: { key: keyof OptimizationOptions; labelKey: string }[] = [
        { key: "removeComments", labelKey: "optRemoveComments" },
        { key: "removeEmptyAttrs", labelKey: "optRemoveEmptyAttrs" },
        { key: "removeMetadata", labelKey: "optRemoveMetadata" },
        { key: "minify", labelKey: "optMinify" },
        { key: "removeDefaults", labelKey: "optRemoveDefaults" },
        { key: "shortHex", labelKey: "optShortHex" },
    ]

    return (
        <div className="space-y-6">
            {/* Input */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{t("inputLabel")}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-1" /> {t("uploadFile")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleClear} disabled={!inputSvg}>
                            <Trash2 className="h-4 w-4 mr-1" /> {t("clear")}
                        </Button>
                    </div>
                </div>
                <Textarea
                    value={inputSvg}
                    onChange={(e) => setInputSvg(e.target.value)}
                    placeholder={t("inputPlaceholder")}
                    className="font-mono text-xs min-h-[200px] resize-y"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </GlassCard>

            {/* Options */}
            <GlassCard className="p-4">
                <h3 className="font-semibold text-sm mb-3">{t("optionsLabel")}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {optionItems.map(({ key, labelKey }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={options[key]}
                                onCheckedChange={() => toggleOption(key)}
                            />
                            <Label htmlFor={key} className="text-sm cursor-pointer">
                                {t(labelKey)}
                            </Label>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Size Comparison */}
            {inputSvg.trim() && (
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">{t("originalSize")}</p>
                            <p className="text-lg font-bold font-mono">{formatBytes(originalSize)}</p>
                        </div>
                        <div className="text-center px-4">
                            <div className={cn(
                                "text-sm font-bold px-3 py-1 rounded-full",
                                Number(savings) > 0 ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
                            )}>
                                {Number(savings) > 0 ? `-${savings}%` : "0%"}
                            </div>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">{t("optimizedSize")}</p>
                            <p className="text-lg font-bold font-mono">{formatBytes(optimizedSize)}</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Preview */}
            {optimizedSvg && (
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Eye className="h-4 w-4" /> {t("previewLabel")}
                        </h3>
                    </div>
                    <div
                        className="rounded-lg bg-muted/30 p-4 flex items-center justify-center min-h-[200px] overflow-hidden border border-border/30"
                        dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                        style={{ maxHeight: 400 }}
                    />
                </GlassCard>
            )}

            {/* Output */}
            {optimizedSvg && (
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{t("outputLabel")}</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                {copied ? <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                {copied ? t("copied") : t("copy")}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-1" /> {t("download")}
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        value={optimizedSvg}
                        readOnly
                        className="font-mono text-xs min-h-[200px] resize-y"
                    />
                </GlassCard>
            )}
        </div>
    )
}
