"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Trash2, ArrowRightLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type Format = "toml" | "ini" | "json"

function detectFormat(input: string): Format {
    const trimmed = input.trim()
    // Try JSON first
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
            JSON.parse(trimmed)
            return "json"
        } catch { /* not json */ }
    }
    // Check for TOML-specific features: quoted keys, arrays, inline tables
    if (/^\[\[.+\]\]/m.test(trimmed) ||
        /^[a-zA-Z0-9_.-]+\s*=\s*\[/m.test(trimmed) ||
        /^[a-zA-Z0-9_.-]+\s*=\s*true|false/m.test(trimmed)) {
        return "toml"
    }
    // Both TOML and INI use [section] and key=value
    // Default to TOML if we see sections with dots or quoted strings
    if (/^\[.+\..+\]/m.test(trimmed)) {
        return "toml"
    }
    // If has sections, guess INI for simpler cases
    if (/^\[.+\]/m.test(trimmed)) {
        return "ini"
    }
    // Default to TOML for key=value
    return "toml"
}

// Simple TOML/INI parser -> nested object
function parseTomlIni(input: string): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    let currentSection = ""
    const lines = input.split("\n")

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line || line.startsWith("#") || line.startsWith(";")) continue

        // Section header
        const sectionMatch = line.match(/^\[([^\]]+)\]$/)
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim()
            // Ensure section exists
            const parts = currentSection.split(".")
            let obj = result
            for (const part of parts) {
                if (!obj[part] || typeof obj[part] !== "object") {
                    obj[part] = {}
                }
                obj = obj[part] as Record<string, unknown>
            }
            continue
        }

        // Key = Value
        const kvMatch = line.match(/^([^=]+)=(.*)$/)
        if (kvMatch) {
            const key = kvMatch[1].trim()
            let value: unknown = kvMatch[2].trim()

            // Parse value types
            const strVal = value as string
            if ((strVal.startsWith('"') && strVal.endsWith('"')) ||
                (strVal.startsWith("'") && strVal.endsWith("'"))) {
                value = strVal.slice(1, -1)
            } else if (strVal === "true") {
                value = true
            } else if (strVal === "false") {
                value = false
            } else if (strVal.startsWith("[") && strVal.endsWith("]")) {
                // Simple array parsing
                try {
                    value = JSON.parse(strVal)
                } catch {
                    // Try comma-separated
                    value = strVal.slice(1, -1).split(",").map(s => {
                        const t = s.trim()
                        if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
                            return t.slice(1, -1)
                        }
                        return isNaN(Number(t)) ? t : Number(t)
                    })
                }
            } else if (!isNaN(Number(strVal)) && strVal !== "") {
                value = Number(strVal)
            }

            if (currentSection) {
                const parts = currentSection.split(".")
                let obj = result
                for (const part of parts) {
                    if (!obj[part] || typeof obj[part] !== "object") {
                        obj[part] = {}
                    }
                    obj = obj[part] as Record<string, unknown>
                }
                obj[key] = value
            } else {
                result[key] = value
            }
        }
    }

    return result
}

function objectToToml(obj: Record<string, unknown>, prefix = ""): string {
    const lines: string[] = []
    const sections: [string, Record<string, unknown>][] = []

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            const sectionKey = prefix ? `${prefix}.${key}` : key
            sections.push([sectionKey, value as Record<string, unknown>])
        } else {
            lines.push(`${key} = ${formatTomlValue(value)}`)
        }
    }

    let result = lines.join("\n")

    for (const [sectionKey, sectionObj] of sections) {
        const sectionContent = objectToToml(sectionObj, sectionKey)
        const hasDirectValues = Object.values(sectionObj).some(v => typeof v !== "object" || Array.isArray(v) || v === null)
        if (hasDirectValues) {
            result += `\n\n[${sectionKey}]\n`
        }
        // Filter out section headers from nested calls and add direct values
        const directLines: string[] = []
        const nestedSections: string[] = []
        for (const line of sectionContent.split("\n")) {
            if (line.startsWith("[")) {
                nestedSections.push(line)
            } else if (line.trim()) {
                directLines.push(line)
            }
        }
        if (hasDirectValues && directLines.length > 0) {
            result += directLines.join("\n")
        }
        if (nestedSections.length > 0) {
            result += "\n" + nestedSections.join("\n")
        }
    }

    return result.trim()
}

function objectToIni(obj: Record<string, unknown>): string {
    const lines: string[] = []
    const sections: [string, Record<string, unknown>][] = []

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            sections.push([key, value as Record<string, unknown>])
        } else {
            lines.push(`${key}=${formatIniValue(value)}`)
        }
    }

    let result = lines.join("\n")

    for (const [sectionKey, sectionObj] of sections) {
        result += `\n\n[${sectionKey}]\n`
        for (const [k, v] of Object.entries(sectionObj)) {
            if (v !== null && typeof v === "object" && !Array.isArray(v)) {
                // Flatten nested objects for INI
                for (const [nk, nv] of Object.entries(v as Record<string, unknown>)) {
                    result += `${k}.${nk}=${formatIniValue(nv)}\n`
                }
            } else {
                result += `${k}=${formatIniValue(v)}\n`
            }
        }
    }

    return result.trim()
}

function formatTomlValue(value: unknown): string {
    if (typeof value === "string") return `"${value}"`
    if (typeof value === "boolean") return value ? "true" : "false"
    if (typeof value === "number") return String(value)
    if (Array.isArray(value)) return `[${value.map(v => formatTomlValue(v)).join(", ")}]`
    return String(value)
}

function formatIniValue(value: unknown): string {
    if (typeof value === "string") return value
    if (typeof value === "boolean") return value ? "true" : "false"
    if (typeof value === "number") return String(value)
    if (Array.isArray(value)) return value.join(",")
    return String(value)
}

function convert(input: string, inputFormat: Format, outputFormat: Format): string {
    // Parse input to object
    let obj: Record<string, unknown>

    if (inputFormat === "json") {
        obj = JSON.parse(input.trim())
    } else {
        obj = parseTomlIni(input)
    }

    // Convert to output
    if (outputFormat === "json") {
        return JSON.stringify(obj, null, 2)
    } else if (outputFormat === "toml") {
        return objectToToml(obj)
    } else {
        return objectToIni(obj)
    }
}

const FORMAT_LABELS: Record<Format, string> = {
    toml: "TOML",
    ini: "INI",
    json: "JSON",
}

export function TomlConverterTool() {
    const t = useTranslations("TomlConverter")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [outputFormat, setOutputFormat] = useState<Format>("json")
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    const detectedFormat = useMemo(() => {
        if (!input.trim()) return null
        return detectFormat(input)
    }, [input])

    const handleConvert = useCallback(() => {
        if (!input.trim()) return
        setError("")
        try {
            const detected = detectFormat(input)
            if (detected === outputFormat) {
                // Same format - just pretty-print if JSON
                if (detected === "json") {
                    setOutput(JSON.stringify(JSON.parse(input.trim()), null, 2))
                } else {
                    setOutput(input)
                }
                return
            }
            const result = convert(input, detected, outputFormat)
            setOutput(result)
        } catch (e) {
            setError(t("parseError"))
            setOutput("")
        }
    }, [input, outputFormat, t])

    const handleCopy = useCallback((text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }, [t])

    const handleClear = useCallback(() => {
        setInput("")
        setOutput("")
        setError("")
    }, [])

    const handleSwap = useCallback(() => {
        if (!output) return
        setInput(output)
        setOutput("")
        setError("")
    }, [output])

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Controls */}
            <GlassCard className="p-4">
                <div className="flex flex-wrap items-center gap-3 justify-center">
                    {detectedFormat && (
                        <span className="text-sm text-muted-foreground">
                            {t("detected")}: <span className="font-semibold text-foreground">{FORMAT_LABELS[detectedFormat]}</span>
                        </span>
                    )}
                    <span className="text-sm text-muted-foreground">{t("outputFormatLabel")}:</span>
                    {(["toml", "ini", "json"] as Format[]).map(fmt => (
                        <Button
                            key={fmt}
                            variant={outputFormat === fmt ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOutputFormat(fmt)}
                        >
                            {FORMAT_LABELS[fmt]}
                        </Button>
                    ))}
                    <Button onClick={handleConvert} className="gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        {t("convert")}
                    </Button>
                    <Button onClick={handleSwap} variant="secondary" size="sm" className="gap-1" disabled={!output}>
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        {t("swap")}
                    </Button>
                    <Button onClick={handleClear} variant="outline" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        {t("clear")}
                    </Button>
                </div>
            </GlassCard>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t("inputLabel")}</Label>
                        {detectedFormat && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {FORMAT_LABELS[detectedFormat]}
                            </span>
                        )}
                    </div>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("inputPlaceholder")}
                        className="font-mono text-sm min-h-[400px] resize-y"
                    />
                </GlassCard>

                {/* Output Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                            {t("outputLabel")} ({FORMAT_LABELS[outputFormat]})
                        </Label>
                        {output && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1"
                                onClick={() => handleCopy(output)}
                            >
                                {copied
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    : <Copy className="h-3.5 w-3.5" />
                                }
                                {t("copy")}
                            </Button>
                        )}
                    </div>
                    <Textarea
                        value={output}
                        readOnly
                        placeholder={t("outputPlaceholder")}
                        className="font-mono text-sm min-h-[400px] resize-y"
                    />
                </GlassCard>
            </div>

            {/* Error */}
            {error && (
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
