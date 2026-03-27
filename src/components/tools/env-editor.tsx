"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Trash2, Plus, X, Download, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface EnvEntry {
    key: string
    value: string
    id: string
}

function parseEnv(text: string): EnvEntry[] {
    const lines = text.split("\n")
    const entries: EnvEntry[] = []
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eqIdx = trimmed.indexOf("=")
        if (eqIdx === -1) continue
        const key = trimmed.substring(0, eqIdx).trim()
        let value = trimmed.substring(eqIdx + 1).trim()
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        entries.push({ key, value, id: crypto.randomUUID() })
    }
    return entries
}

function entriesToEnv(entries: EnvEntry[]): string {
    return entries
        .filter(e => e.key.trim())
        .map(e => {
            const needsQuotes = e.value.includes(" ") || e.value.includes("=") || e.value.includes("#")
            return `${e.key}=${needsQuotes ? `"${e.value}"` : e.value}`
        })
        .join("\n")
}

type DiffStatus = "added" | "removed" | "changed" | "unchanged"

interface DiffEntry {
    key: string
    leftValue?: string
    rightValue?: string
    status: DiffStatus
}

function computeDiff(left: EnvEntry[], right: EnvEntry[]): DiffEntry[] {
    const leftMap = new Map(left.map(e => [e.key, e.value]))
    const rightMap = new Map(right.map(e => [e.key, e.value]))
    const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()])
    const result: DiffEntry[] = []

    for (const key of allKeys) {
        const lv = leftMap.get(key)
        const rv = rightMap.get(key)
        if (lv !== undefined && rv === undefined) {
            result.push({ key, leftValue: lv, status: "removed" })
        } else if (lv === undefined && rv !== undefined) {
            result.push({ key, rightValue: rv, status: "added" })
        } else if (lv !== rv) {
            result.push({ key, leftValue: lv, rightValue: rv, status: "changed" })
        } else {
            result.push({ key, leftValue: lv, rightValue: rv, status: "unchanged" })
        }
    }

    return result.sort((a, b) => {
        const order: Record<DiffStatus, number> = { removed: 0, changed: 1, added: 2, unchanged: 3 }
        return order[a.status] - order[b.status]
    })
}

export function EnvEditorTool() {
    const t = useTranslations("EnvEditor")
    const [leftText, setLeftText] = useState("")
    const [rightText, setRightText] = useState("")
    const [leftEntries, setLeftEntries] = useState<EnvEntry[]>([])
    const [rightEntries, setRightEntries] = useState<EnvEntry[]>([])
    const [mode, setMode] = useState<"edit" | "diff">("edit")
    const [copied, setCopied] = useState(false)

    const handleParseLeft = useCallback(() => {
        setLeftEntries(parseEnv(leftText))
    }, [leftText])

    const handleParseRight = useCallback(() => {
        setRightEntries(parseEnv(rightText))
    }, [rightText])

    const handleParseBoth = useCallback(() => {
        setLeftEntries(parseEnv(leftText))
        setRightEntries(parseEnv(rightText))
        setMode("diff")
    }, [leftText, rightText])

    const diff = useMemo(() => {
        if (mode !== "diff") return []
        return computeDiff(leftEntries, rightEntries)
    }, [mode, leftEntries, rightEntries])

    const addEntry = useCallback((side: "left" | "right") => {
        const newEntry: EnvEntry = { key: "", value: "", id: crypto.randomUUID() }
        if (side === "left") {
            setLeftEntries(prev => [...prev, newEntry])
        } else {
            setRightEntries(prev => [...prev, newEntry])
        }
    }, [])

    const removeEntry = useCallback((side: "left" | "right", id: string) => {
        if (side === "left") {
            setLeftEntries(prev => prev.filter(e => e.id !== id))
        } else {
            setRightEntries(prev => prev.filter(e => e.id !== id))
        }
    }, [])

    const updateEntry = useCallback((side: "left" | "right", id: string, field: "key" | "value", val: string) => {
        const setter = side === "left" ? setLeftEntries : setRightEntries
        setter(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e))
    }, [])

    const handleCopy = useCallback((text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }, [t])

    const handleExport = useCallback((entries: EnvEntry[], filename: string) => {
        const content = entriesToEnv(entries)
        const blob = new Blob([content], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success(t("exported"))
    }, [t])

    const handleClear = useCallback(() => {
        setLeftText("")
        setRightText("")
        setLeftEntries([])
        setRightEntries([])
        setMode("edit")
    }, [])

    const statusColors: Record<DiffStatus, string> = {
        added: "bg-green-500/10 text-green-700 dark:text-green-400",
        removed: "bg-red-500/10 text-red-700 dark:text-red-400",
        changed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        unchanged: "text-muted-foreground",
    }

    const statusLabels: Record<DiffStatus, string> = {
        added: t("statusAdded"),
        removed: t("statusRemoved"),
        changed: t("statusChanged"),
        unchanged: t("statusUnchanged"),
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
                <Button onClick={handleParseBoth} className="gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    {t("compare")}
                </Button>
                <Button onClick={() => setMode("edit")} variant={mode === "edit" ? "secondary" : "outline"} className="gap-2">
                    {t("editMode")}
                </Button>
                <Button onClick={handleClear} variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t("clear")}
                </Button>
            </div>

            {/* Two-panel input */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t("leftLabel")}</Label>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleCopy(leftText || entriesToEnv(leftEntries))}>
                                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                {t("copy")}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleExport(leftEntries, ".env.example")}>
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    {mode === "edit" && leftEntries.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {leftEntries.map((entry) => (
                                <div key={entry.id} className="flex items-center gap-2">
                                    <Input
                                        value={entry.key}
                                        onChange={(e) => updateEntry("left", entry.id, "key", e.target.value)}
                                        placeholder="KEY"
                                        className="font-mono text-sm w-1/3"
                                    />
                                    <span className="text-muted-foreground">=</span>
                                    <Input
                                        value={entry.value}
                                        onChange={(e) => updateEntry("left", entry.id, "value", e.target.value)}
                                        placeholder="value"
                                        className="font-mono text-sm flex-1"
                                    />
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeEntry("left", entry.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => addEntry("left")}>
                                <Plus className="h-3.5 w-3.5" />
                                {t("addVariable")}
                            </Button>
                        </div>
                    ) : (
                        <Textarea
                            value={leftText}
                            onChange={(e) => setLeftText(e.target.value)}
                            placeholder={t("leftPlaceholder")}
                            className="font-mono text-sm min-h-[400px] resize-y"
                        />
                    )}
                </GlassCard>

                {/* Right Panel */}
                <GlassCard className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">{t("rightLabel")}</Label>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleCopy(rightText || entriesToEnv(rightEntries))}>
                                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                {t("copy")}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleExport(rightEntries, ".env.local")}>
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    {mode === "edit" && rightEntries.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {rightEntries.map((entry) => (
                                <div key={entry.id} className="flex items-center gap-2">
                                    <Input
                                        value={entry.key}
                                        onChange={(e) => updateEntry("right", entry.id, "key", e.target.value)}
                                        placeholder="KEY"
                                        className="font-mono text-sm w-1/3"
                                    />
                                    <span className="text-muted-foreground">=</span>
                                    <Input
                                        value={entry.value}
                                        onChange={(e) => updateEntry("right", entry.id, "value", e.target.value)}
                                        placeholder="value"
                                        className="font-mono text-sm flex-1"
                                    />
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeEntry("right", entry.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => addEntry("right")}>
                                <Plus className="h-3.5 w-3.5" />
                                {t("addVariable")}
                            </Button>
                        </div>
                    ) : (
                        <Textarea
                            value={rightText}
                            onChange={(e) => setRightText(e.target.value)}
                            placeholder={t("rightPlaceholder")}
                            className="font-mono text-sm min-h-[400px] resize-y"
                        />
                    )}
                </GlassCard>
            </div>

            {/* Diff View */}
            {mode === "diff" && diff.length > 0 && (
                <GlassCard className="p-4 space-y-3">
                    <Label className="text-sm font-semibold">{t("diffTitle")}</Label>
                    <div className="space-y-1">
                        {diff.map((entry, idx) => (
                            <div
                                key={`${entry.key}-${idx}`}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono",
                                    statusColors[entry.status]
                                )}
                            >
                                <span className="text-xs font-sans px-1.5 py-0.5 rounded border border-current/20 whitespace-nowrap">
                                    {statusLabels[entry.status]}
                                </span>
                                <span className="font-semibold min-w-[120px]">{entry.key}</span>
                                {entry.status === "changed" ? (
                                    <span className="flex-1 truncate">
                                        <span className="line-through opacity-60">{entry.leftValue}</span>
                                        {" -> "}
                                        <span>{entry.rightValue}</span>
                                    </span>
                                ) : (
                                    <span className="flex-1 truncate">
                                        {entry.leftValue || entry.rightValue}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <span>{t("diffSummary", {
                            added: diff.filter(d => d.status === "added").length,
                            removed: diff.filter(d => d.status === "removed").length,
                            changed: diff.filter(d => d.status === "changed").length,
                        })}</span>
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
