"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { diffLines, type Change } from "diff"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import {
    Copy,
    CheckCircle2,
    FileJson,
    Trash2,
    GitCompareArrows,
    Layers,
    ListFilter,
    Columns,
    Maximize2,
    ShieldAlert
} from "lucide-react"

// Recursive function to sort keys of an object/array
function sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== "object") {
        return obj
    }
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys)
    }
    const sortedKeys = Object.keys(obj).sort()
    const sortedObj: any = {}
    for (const key of sortedKeys) {
        sortedObj[key] = sortObjectKeys(obj[key])
    }
    return sortedObj
}

interface DiffLine {
    num?: number
    text: string
    type: "normal" | "added" | "removed" | "empty"
}

export function JsonDiff() {
    const t = useTranslations("JsonDiff")

    // Input JSON strings
    const [original, setOriginal] = useState("")
    const [modified, setModified] = useState("")

    // Options
    const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true)
    const [viewMode, setViewMode] = useState<"split" | "unified">("split")

    // Status states
    const [copied, setCopied] = useState(false)

    // Formatted strings (parsed, sorted if requested, and pretty-printed).
    // Parse errors are derived here and returned, never stored via setState in
    // render — keeps the memo pure and avoids circular re-renders.
    const formatted = useMemo(() => {
        let origFormatted = ""
        let modFormatted = ""
        let origError: string | null = null
        let modError: string | null = null

        if (original.trim()) {
            try {
                const parsed = JSON.parse(original)
                const prepared = ignoreKeyOrder ? sortObjectKeys(parsed) : parsed
                origFormatted = JSON.stringify(prepared, null, 2)
            } catch (err: any) {
                origError = t("errorInvalidJson", { error: err.message })
            }
        }

        if (modified.trim()) {
            try {
                const parsed = JSON.parse(modified)
                const prepared = ignoreKeyOrder ? sortObjectKeys(parsed) : parsed
                modFormatted = JSON.stringify(prepared, null, 2)
            } catch (err: any) {
                modError = t("errorInvalidJson", { error: err.message })
            }
        }

        return {
            orig: origError ? "" : origFormatted,
            mod: modError ? "" : modFormatted,
            origError,
            modError,
            hasError: Boolean(origError || modError),
        }
    }, [original, modified, ignoreKeyOrder, t])

    const { origError, modError } = formatted

    // Pretty-print the input fields in place. Invalid JSON is left untouched —
    // the derived error from `formatted` already surfaces the parse failure.
    const formatInputFields = () => {
        if (original.trim()) {
            try {
                setOriginal(JSON.stringify(JSON.parse(original), null, 2))
            } catch {
                /* invalid JSON: error shown via formatted.origError */
            }
        }
        if (modified.trim()) {
            try {
                setModified(JSON.stringify(JSON.parse(modified), null, 2))
            } catch {
                /* invalid JSON: error shown via formatted.modError */
            }
        }
    }

    // Compute diff using jsdiff
    const diffResult = useMemo(() => {
        if (formatted.hasError || (!formatted.orig && !formatted.mod)) {
            return []
        }
        return diffLines(formatted.orig, formatted.mod)
    }, [formatted])

    // Generate stats for diff
    const stats = useMemo(() => {
        let added = 0
        let removed = 0
        let unchanged = 0

        diffResult.forEach((part) => {
            const lines = part.value.split("\n")
            // Ignore last empty line from split
            const count = lines[lines.length - 1] === "" ? lines.length - 1 : lines.length
            if (part.added) added += count
            else if (part.removed) removed += count
            else unchanged += count
        })

        return { added, removed, unchanged }
    }, [diffResult])

    // Align lines side-by-side for Split View
    const splitLines = useMemo(() => {
        const origList: DiffLine[] = []
        const modList: DiffLine[] = []

        let origLineNum = 1
        let modLineNum = 1

        let i = 0
        while (i < diffResult.length) {
            const part = diffResult[i]
            const nextPart = diffResult[i + 1]

            if (!part.added && !part.removed) {
                // Unchanged lines
                const lines = part.value.split("\n")
                if (lines[lines.length - 1] === "" && i === diffResult.length - 1) {
                    lines.pop()
                }
                lines.forEach((line) => {
                    origList.push({ text: line, type: "normal", num: origLineNum++ })
                    modList.push({ text: line, type: "normal", num: modLineNum++ })
                })
                i++
            } else if (part.removed) {
                // Check if followed by added (which means edit/replacement)
                if (nextPart && nextPart.added) {
                    const remLines = part.value.split("\n")
                    if (remLines[remLines.length - 1] === "" && i + 1 === diffResult.length - 1) remLines.pop()
                    const addLines = nextPart.value.split("\n")
                    if (addLines[addLines.length - 1] === "" && i + 1 === diffResult.length - 1) addLines.pop()

                    const maxLen = Math.max(remLines.length, addLines.length)
                    for (let k = 0; k < maxLen; k++) {
                        if (k < remLines.length) {
                            origList.push({ text: remLines[k], type: "removed", num: origLineNum++ })
                        } else {
                            origList.push({ text: "", type: "empty" })
                        }

                        if (k < addLines.length) {
                            modList.push({ text: addLines[k], type: "added", num: modLineNum++ })
                        } else {
                            modList.push({ text: "", type: "empty" })
                        }
                    }
                    i += 2
                } else {
                    // Just removed
                    const remLines = part.value.split("\n")
                    if (remLines[remLines.length - 1] === "" && i === diffResult.length - 1) remLines.pop()
                    remLines.forEach((line) => {
                        origList.push({ text: line, type: "removed", num: origLineNum++ })
                        modList.push({ text: "", type: "empty" })
                    })
                    i++
                }
            } else if (part.added) {
                // Just added
                const addLines = part.value.split("\n")
                if (addLines[addLines.length - 1] === "" && i === diffResult.length - 1) addLines.pop()
                addLines.forEach((line) => {
                    origList.push({ text: "", type: "empty" })
                    modList.push({ text: line, type: "added", num: modLineNum++ })
                })
                i++
            }
        }

        return { orig: origList, mod: modList }
    }, [diffResult])

    // Copy full diff text (unified format)
    const copyDiffText = () => {
        if (diffResult.length === 0) return
        const diffText = diffResult
            .map((part) => {
                const prefix = part.added ? "+ " : part.removed ? "- " : "  "
                const lines = part.value.split("\n")
                if (lines[lines.length - 1] === "") lines.pop()
                return lines.map((l) => prefix + l).join("\n")
            })
            .join("\n")

        navigator.clipboard.writeText(diffText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const hasContent = original.trim() !== "" || modified.trim() !== ""

    return (
        <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Options Panel */}
            <Card className="border-primary/10 shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    {/* View mode toggle */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-1">
                            {t("viewMode")}
                        </Label>
                        <Button
                            variant={viewMode === "split" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("split")}
                            className="h-8 gap-1 rounded-lg text-xs"
                        >
                            <Columns className="h-3.5 w-3.5" />
                            {t("splitView")}
                        </Button>
                        <Button
                            variant={viewMode === "unified" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("unified")}
                            className="h-8 gap-1 rounded-lg text-xs"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                            {t("unifiedView")}
                        </Button>
                    </div>

                    {/* Ignore key order toggle */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="ignore-key-order"
                                checked={ignoreKeyOrder}
                                onCheckedChange={setIgnoreKeyOrder}
                            />
                            <Label htmlFor="ignore-key-order" className="text-sm font-semibold cursor-pointer select-none">
                                {t("ignoreKeyOrder")}
                            </Label>
                        </div>

                        {/* Format buttons */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={formatInputFields}
                            disabled={!hasContent}
                            className="h-8 gap-1 rounded-lg text-xs"
                        >
                            <ListFilter className="h-3.5 w-3.5" />
                            {t("formatJson")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original JSON */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="origJson" className="text-sm font-semibold text-muted-foreground">
                            {t("originalLabel")}
                        </Label>
                        {original && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOriginal("")}
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t("clear")}
                            </Button>
                        )}
                    </div>
                    <Textarea
                        id="origJson"
                        placeholder={t("originalPlaceholder")}
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        className={cn(
                            "min-h-[240px] font-mono text-xs bg-background/50 focus:bg-background transition-all resize-y",
                            origError && "border-destructive/50 focus-visible:ring-destructive"
                        )}
                    />
                    {origError && (
                        <p className="text-xs text-destructive font-medium px-1">{origError}</p>
                    )}
                </div>

                {/* Modified JSON */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <Label htmlFor="modJson" className="text-sm font-semibold text-muted-foreground">
                            {t("modifiedLabel")}
                        </Label>
                        {modified && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setModified("")}
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t("clear")}
                            </Button>
                        )}
                    </div>
                    <Textarea
                        id="modJson"
                        placeholder={t("modifiedPlaceholder")}
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        className={cn(
                            "min-h-[240px] font-mono text-xs bg-background/50 focus:bg-background transition-all resize-y",
                            modError && "border-destructive/50 focus-visible:ring-destructive"
                        )}
                    />
                    {modError && (
                        <p className="text-xs text-destructive font-medium px-1">{modError}</p>
                    )}
                </div>
            </div>

            {/* Stats bar */}
            {hasContent && !formatted.hasError && (
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <span className="text-muted-foreground mr-1">{t("stats")}:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        +{stats.added} {t("added")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        -{stats.removed} {t("removed")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                        {stats.unchanged} {t("unchanged")}
                    </span>
                </div>
            )}

            {/* Diff Result rendering */}
            <GlassCard className="overflow-hidden shadow-lg border border-primary/10">
                {/* Result header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <GitCompareArrows className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Diff Result</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyDiffText}
                        disabled={!hasContent || diffResult.length === 0 || formatted.hasError}
                        className="h-7 px-3 text-xs gap-1.5 rounded-lg"
                    >
                        {copied ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? t("copied") : t("copyDiff")}
                    </Button>
                </div>

                {/* Diff Body */}
                <div className="min-h-[160px] bg-secondary/10">
                    {!hasContent ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
                            <FileJson className="h-8 w-8 opacity-30" />
                            <span>Enter JSON in both fields to inspect the difference</span>
                        </div>
                    ) : formatted.hasError ? (
                        <div className="flex flex-col items-center justify-center h-48 text-destructive text-sm space-y-2">
                            <ShieldAlert className="h-8 w-8 opacity-30" />
                            <span>Please resolve syntax errors above to compute diff</span>
                        </div>
                    ) : diffResult.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
                            <CheckCircle2 className="h-8 w-8 opacity-30 text-green-500" />
                            <span className="font-semibold text-foreground/80">{t("noDiff")}</span>
                        </div>
                    ) : viewMode === "unified" ? (
                        /* Unified View */
                        <div className="overflow-x-auto max-h-[500px] font-mono text-[12px] leading-5 divide-y divide-border/5">
                            {diffResult.map((part, i) => {
                                const lines = part.value.split("\n")
                                if (lines[lines.length - 1] === "" && i === diffResult.length - 1) {
                                    lines.pop()
                                }
                                return lines.map((line, j) => (
                                    <div
                                        key={`${i}-${j}`}
                                        className={cn(
                                            "flex items-start px-4 py-0.5 whitespace-pre leading-6",
                                            part.added && "bg-green-500/10 text-green-700 dark:text-green-400 border-l-2 border-green-500",
                                            part.removed && "bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500",
                                            !part.added && !part.removed && "text-foreground/70"
                                        )}
                                    >
                                        <span className="select-none w-5 shrink-0 opacity-40 font-bold">
                                            {part.added ? "+" : part.removed ? "-" : " "}
                                        </span>
                                        <span className="flex-1">{line}</span>
                                    </div>
                                ))
                            })}
                        </div>
                    ) : (
                        /* Split View (Side-by-Side) */
                        <div className="grid grid-cols-2 divide-x divide-border/50 max-h-[500px] overflow-y-auto">
                            {/* Left Side (Original) */}
                            <div className="font-mono text-[12px] leading-5 bg-background/10">
                                {splitLines.orig.map((line, idx) => (
                                    <div
                                        key={`orig-${idx}`}
                                        className={cn(
                                            "flex items-start px-3 py-0.5 whitespace-pre leading-6 min-h-[24px]",
                                            line.type === "removed" && "bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500",
                                            line.type === "normal" && "text-foreground/70",
                                            line.type === "empty" && "bg-muted/10 opacity-20 select-none"
                                        )}
                                    >
                                        <span className="select-none w-8 shrink-0 opacity-30 text-right pr-2 text-[10px] select-none">
                                            {line.num || ""}
                                        </span>
                                        <span className="flex-1">{line.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Right Side (Modified) */}
                            <div className="font-mono text-[12px] leading-5 bg-background/10">
                                {splitLines.mod.map((line, idx) => (
                                    <div
                                        key={`mod-${idx}`}
                                        className={cn(
                                            "flex items-start px-3 py-0.5 whitespace-pre leading-6 min-h-[24px]",
                                            line.type === "added" && "bg-green-500/10 text-green-700 dark:text-green-400 border-l-2 border-green-500",
                                            line.type === "normal" && "text-foreground/70",
                                            line.type === "empty" && "bg-muted/10 opacity-20 select-none"
                                        )}
                                    >
                                        <span className="select-none w-8 shrink-0 opacity-30 text-right pr-2 text-[10px] select-none">
                                            {line.num || ""}
                                        </span>
                                        <span className="flex-1">{line.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    )
}
