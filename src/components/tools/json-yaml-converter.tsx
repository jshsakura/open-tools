"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, AlertCircle, Trash2, Download } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

type Direction = "json-to-yaml" | "yaml-to-json"

const INDENT_OPTIONS = [2, 4] as const

export function JsonYamlConverter() {
    const t = useTranslations("JsonYaml")

    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [direction, setDirection] = useState<Direction>("json-to-yaml")
    const [indent, setIndent] = useState(2)
    const [sortKeys, setSortKeys] = useState(false)

    const isJsonToYaml = direction === "json-to-yaml"

    // Live conversion on input / direction / option changes.
    useEffect(() => {
        if (!input.trim()) {
            setOutput("")
            setError(null)
            return
        }

        try {
            const result = isJsonToYaml
                ? jsonToYaml(input, { indent, sortKeys })
                : yamlToJson(input, { indent, sortKeys })
            setOutput(result)
            setError(null)
        } catch (e) {
            setOutput("")
            const label = isJsonToYaml ? "Invalid JSON" : "Invalid YAML"
            setError(`${label}: ${e instanceof Error ? e.message : String(e)}`)
        }
    }, [input, isJsonToYaml, indent, sortKeys])

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        toast.success(t("copied"))
    }

    const downloadOutput = () => {
        if (!output) return
        const ext = isJsonToYaml ? "yaml" : "json"
        const type = isJsonToYaml
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

    const clearAll = () => {
        setInput("")
        setOutput("")
        setError(null)
    }

    const onDirectionChange = (value: string) => {
        setDirection(value as Direction)
        // Output of the previous direction becomes the input of the new one.
        setInput(output)
    }

    return (
        <div className="max-w-5xl mx-auto">
            <GlassCard className="p-6 rounded-2xl">
                <Tabs value={direction} onValueChange={onDirectionChange} className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <TabsList className="bg-muted/30 p-1 rounded-xl">
                            <TabsTrigger
                                value="json-to-yaml"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                JSON → YAML
                            </TabsTrigger>
                            <TabsTrigger
                                value="yaml-to-json"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                YAML → JSON
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-wrap items-center gap-4">
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
                                <Switch
                                    checked={sortKeys}
                                    onCheckedChange={setSortKeys}
                                    id="json-yaml-sort"
                                />
                                <Label htmlFor="json-yaml-sort" className="text-sm text-muted-foreground">
                                    {t("sortKeys")}
                                </Label>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-8 text-muted-foreground"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("clear")}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <Alert
                            variant="destructive"
                            className="mb-6 bg-red-500/10 border-red-500/20 text-red-500"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("error")}</AlertTitle>
                            <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 h-[600px]">
                        {/* Input */}
                        <div className="flex flex-col gap-2 h-full">
                            <Label className="text-muted-foreground ml-1">
                                {isJsonToYaml ? t("jsonInput") : t("yamlInput")}
                            </Label>
                            <Textarea
                                className="flex-1 font-mono text-sm bg-muted/20 border-border/40 resize-none focus-visible:ring-primary/50 rounded-xl leading-relaxed"
                                placeholder={isJsonToYaml ? t("jsonPlaceholder") : t("yamlPlaceholder")}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>

                        {/* Output */}
                        <div className="flex flex-col gap-2 h-full">
                            <div className="flex justify-between items-center">
                                <Label className="text-muted-foreground ml-1">
                                    {isJsonToYaml ? t("yamlOutput") : t("jsonOutput")}
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={downloadOutput}
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        {t("download")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={copyToClipboard}
                                    >
                                        <Copy className="w-3 h-3 mr-1" />
                                        {t("copy")}
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                className="flex-1 font-mono text-sm bg-muted/30 border-border/40 resize-none focus-visible:ring-primary/50 rounded-xl leading-relaxed text-muted-foreground"
                                readOnly
                                value={output}
                                placeholder={t("resultPlaceholder")}
                            />
                        </div>
                    </div>
                </Tabs>
            </GlassCard>
        </div>
    )
}
