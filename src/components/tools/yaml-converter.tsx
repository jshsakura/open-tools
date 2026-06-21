"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, AlertCircle, Trash2, Download } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { jsonToYaml, yamlToJson } from "./yaml-convert.utils"

type Mode = "toYaml" | "toJson"

const INDENT_OPTIONS = [2, 4] as const

export function YamlConverter() {
    const t = useTranslations("YamlConverter")

    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<Mode>("toJson")
    const [indent, setIndent] = useState(2)
    const [sortKeys, setSortKeys] = useState(false)

    // Live conversion: re-run whenever input, target mode, or options change.
    useEffect(() => {
        if (!input.trim()) {
            setOutput("")
            setError(null)
            return
        }

        try {
            const result =
                mode === "toYaml"
                    ? jsonToYaml(input, { indent, sortKeys })
                    : yamlToJson(input, { indent, sortKeys })
            setOutput(result)
            setError(null)
        } catch (e) {
            setOutput("")
            setError(e instanceof Error ? e.message : String(e))
        }
    }, [input, mode, indent, sortKeys])

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        toast.success(t("copied"))
    }

    const downloadOutput = () => {
        if (!output) return
        const ext = mode === "toYaml" ? "yaml" : "json"
        const type =
            mode === "toYaml"
                ? "text/yaml;charset=utf-8"
                : "application/json;charset=utf-8"
        const blob = new Blob([output], { type })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `converted.${ext}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success(t("downloaded"))
    }

    const clearInput = () => {
        setInput("")
        setOutput("")
        setError(null)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <GlassCard className="p-6">
                {/* Options bar */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">{t("indent")}</Label>
                        <Select
                            value={String(indent)}
                            onValueChange={(v) => setIndent(Number(v))}
                        >
                            <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INDENT_OPTIONS.map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch checked={sortKeys} onCheckedChange={setSortKeys} id="sort-keys" />
                        <Label htmlFor="sort-keys" className="text-sm text-muted-foreground">
                            {t("sortKeys")}
                        </Label>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">{t("input")}</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearInput}
                                className="text-muted-foreground h-8"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("clear")}
                            </Button>
                        </div>
                        <Textarea
                            className="min-h-[400px] font-mono text-sm bg-muted/20 resize-none"
                            placeholder={t("placeholder")}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">{t("output")}</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={mode === "toJson" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMode("toJson")}
                                    className="h-8"
                                >
                                    {t("toJson")}
                                </Button>
                                <Button
                                    variant={mode === "toYaml" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMode("toYaml")}
                                    className="h-8"
                                >
                                    {t("toYaml")}
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Textarea
                                className="min-h-[400px] font-mono text-sm bg-muted/30 resize-none"
                                value={output}
                                readOnly
                            />
                            {output && (
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8" onClick={downloadOutput}>
                                        <Download className="w-4 h-4 mr-2" />
                                        {t("download")}
                                    </Button>
                                    <Button size="sm" className="h-8" onClick={copyToClipboard}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        {t("copy")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert
                        variant="destructive"
                        className="mt-6 bg-red-500/10 border-red-500/20 text-red-500"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                    </Alert>
                )}
            </GlassCard>
        </div>
    )
}
