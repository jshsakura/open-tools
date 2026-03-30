"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Code2, Wand2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

type Language = "javascript" | "typescript" | "json" | "css" | "html" | "sql"

const LANGUAGES: { value: Language; label: string }[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "json", label: "JSON" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
    { value: "sql", label: "SQL" },
]

function formatJSON(code: string, indent: number): string {
    try { return JSON.stringify(JSON.parse(code), null, indent) } catch { return code }
}

function formatCSS(code: string, indent: number): string {
    let formatted = code
        .replace(/\s*{\s*/g, " {\n")
        .replace(/\s*}\s*/g, "\n}\n\n")
        .replace(/;\s*/g, ";\n")
        .replace(/,\s*/g, ",\n")

    const lines = formatted.split("\n")
    let level = 0
    const result: string[] = []
    const indentStr = " ".repeat(indent)

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) { result.push(""); continue }
        if (line.startsWith("}")) level = Math.max(0, level - 1)
        result.push(indentStr.repeat(level) + line)
        if (line.endsWith("{")) level++
    }
    return result.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

function formatHTML(code: string, indent: number): string {
    const indentStr = " ".repeat(indent)
    let level = 0
    const lines = code
        .replace(/>\s*</g, ">\n<")
        .split("\n")

    const result: string[] = []
    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (line.startsWith("</")) level = Math.max(0, level - 1)
        result.push(indentStr.repeat(level) + line)
        if (line.match(/^<[^/!][^>]*[^/]>$/) && !line.match(/^<(img|br|hr|input|meta|link)/i)) level++
    }
    return result.join("\n")
}

function formatSQL(code: string, indent: number): string {
    const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "UNION", "UNION ALL"]
    let formatted = code.trim()
    const indentStr = " ".repeat(indent)

    // Uppercase keywords
    for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, "gi")
        formatted = formatted.replace(regex, kw)
    }

    // Add newlines before major keywords
    for (const kw of ["SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "VALUES", "SET", "UNION"]) {
        formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, "g"), `\n${kw}`)
    }

    // Indent
    const lines = formatted.split("\n").filter(l => l.trim())
    const result: string[] = []
    for (const line of lines) {
        const trimmed = line.trim()
        if (["AND", "OR", "ON"].some(k => trimmed.startsWith(k))) {
            result.push(indentStr + trimmed)
        } else {
            result.push(trimmed)
        }
    }
    return result.join("\n")
}

function formatJS(code: string, indent: number, useSemicolons: boolean): string {
    // Basic JS/TS formatting
    let formatted = code
    const indentStr = " ".repeat(indent)

    // Normalize whitespace
    formatted = formatted
        .replace(/\s*{\s*/g, " {\n")
        .replace(/\s*}\s*/g, "\n}\n")
        .replace(/;\s*/g, (useSemicolons ? ";" : "") + "\n")
        .replace(/,\s*/g, ",\n")

    const lines = formatted.split("\n")
    let level = 0
    const result: string[] = []

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue
        if (line.startsWith("}") || line.startsWith("]") || line.startsWith(")")) level = Math.max(0, level - 1)
        result.push(indentStr.repeat(level) + line)
        if (line.endsWith("{") || line.endsWith("[") || line.endsWith("(")) level++
    }
    return result.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

function minifyCode(code: string, lang: Language): string {
    switch (lang) {
        case "json":
            try { return JSON.stringify(JSON.parse(code)) } catch { return code }
        case "css":
            return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim()
        case "html":
            return code.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim()
        case "sql":
            return code.replace(/\s+/g, " ").trim()
        default:
            return code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim()
    }
}

export function CodeFormatter() {
    const t = useTranslations("CodeFormatter")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [language, setLanguage] = useState<Language>("javascript")
    const [indentSize, setIndentSize] = useState(2)
    const [useSemicolons, setUseSemicolons] = useState(true)
    const [copied, setCopied] = useState(false)

    const format = useCallback(() => {
        if (!input.trim()) return
        let result = ""
        switch (language) {
            case "json": result = formatJSON(input, indentSize); break
            case "css": result = formatCSS(input, indentSize); break
            case "html": result = formatHTML(input, indentSize); break
            case "sql": result = formatSQL(input, indentSize); break
            default: result = formatJS(input, indentSize, useSemicolons); break
        }
        setOutput(result)
        toast.success(t("formatted"))
    }, [input, language, indentSize, useSemicolons, t])

    const minify = useCallback(() => {
        if (!input.trim()) return
        setOutput(minifyCode(input, language))
        toast.success(t("minified"))
    }, [input, language, t])

    const copy = () => {
        navigator.clipboard.writeText(output || input)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            {/* Settings */}
            <GlassCard className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold">{t("language")}</Label>
                        <Select value={language} onValueChange={v => setLanguage(v as Language)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map(l => (
                                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold">{t("indent")}</Label>
                        <div className="flex gap-1">
                            {[2, 4].map(n => (
                                <Button key={n} size="sm" variant={indentSize === n ? "default" : "outline"} onClick={() => setIndentSize(n)} className="h-8 w-8 text-xs">
                                    {n}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {(language === "javascript" || language === "typescript") && (
                        <div className="flex items-center gap-2">
                            <Switch checked={useSemicolons} onCheckedChange={setUseSemicolons} id="semicolons" />
                            <Label htmlFor="semicolons" className="text-xs font-bold">{t("semicolons")}</Label>
                        </div>
                    )}

                    <div className="ml-auto flex gap-2">
                        <Button onClick={format} className="gap-1 font-bold h-8 text-xs">
                            <Wand2 className="w-3 h-3" /> {t("format")}
                        </Button>
                        <Button variant="outline" onClick={minify} className="gap-1 h-8 text-xs">
                            <Minimize2 className="w-3 h-3" /> {t("minify")}
                        </Button>
                        <Button variant="outline" onClick={copy} className="gap-1 h-8 text-xs">
                            {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {t("copy")}
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard className="p-0 overflow-hidden">
                    <div className="border-b border-border/10 bg-muted/30 p-3 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{t("input")}</span>
                        <span className="text-xs text-muted-foreground ml-auto font-mono">{input.length} chars</span>
                    </div>
                    <Textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="min-h-[500px] border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0 p-4"
                        placeholder={t("inputPlaceholder")}
                    />
                </GlassCard>

                <GlassCard className="p-0 overflow-hidden">
                    <div className="border-b border-border/10 bg-muted/30 p-3 flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{t("output")}</span>
                        <span className="text-xs text-muted-foreground ml-auto font-mono">{output.length} chars</span>
                    </div>
                    <Textarea
                        value={output}
                        readOnly
                        className="min-h-[500px] border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0 p-4 bg-muted/10"
                        placeholder={t("outputPlaceholder")}
                    />
                </GlassCard>
            </div>
        </div>
    )
}
