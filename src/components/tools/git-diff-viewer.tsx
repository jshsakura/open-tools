"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, ChevronDown, ChevronRight, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DiffHunk {
    header: string
    oldStart: number
    oldCount: number
    newStart: number
    newCount: number
    lines: DiffLine[]
}

interface DiffLine {
    type: "add" | "remove" | "context" | "header"
    content: string
    oldLineNo?: number
    newLineNo?: number
}

interface FileDiff {
    fileName: string
    oldFile: string
    newFile: string
    hunks: DiffHunk[]
    additions: number
    deletions: number
    rawContent: string
}

function parseDiff(input: string): FileDiff[] {
    const files: FileDiff[] = []
    const lines = input.split("\n")
    let currentFile: FileDiff | null = null
    let currentHunk: DiffHunk | null = null
    let oldLineNo = 0
    let newLineNo = 0
    let rawLines: string[] = []

    const flushFile = () => {
        if (currentFile) {
            if (currentHunk) currentFile.hunks.push(currentHunk)
            currentFile.rawContent = rawLines.join("\n")
            files.push(currentFile)
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // New file diff
        if (line.startsWith("diff --git ") || line.startsWith("diff ")) {
            flushFile()
            const match = line.match(/diff --git a\/(.+?) b\/(.+)/)
            const fileName = match ? match[2] : line.replace(/^diff\s+/, "")
            currentFile = {
                fileName,
                oldFile: "",
                newFile: "",
                hunks: [],
                additions: 0,
                deletions: 0,
                rawContent: "",
            }
            currentHunk = null
            rawLines = [line]
            continue
        }

        if (!currentFile && (line.startsWith("---") || line.startsWith("@@"))) {
            // Diff without "diff --git" header
            currentFile = {
                fileName: "file",
                oldFile: "",
                newFile: "",
                hunks: [],
                additions: 0,
                deletions: 0,
                rawContent: "",
            }
            rawLines = []
        }

        if (currentFile) {
            rawLines.push(line)
        }

        if (line.startsWith("--- ") && currentFile) {
            currentFile.oldFile = line.replace(/^--- (a\/)?/, "")
            continue
        }

        if (line.startsWith("+++ ") && currentFile) {
            currentFile.newFile = line.replace(/^\+\+\+ (b\/)?/, "")
            if (currentFile.fileName === "file") {
                currentFile.fileName = currentFile.newFile || currentFile.oldFile
            }
            continue
        }

        // Hunk header
        const hunkMatch = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)/)
        if (hunkMatch && currentFile) {
            if (currentHunk) currentFile.hunks.push(currentHunk)
            const oldStart = parseInt(hunkMatch[1])
            const oldCount = parseInt(hunkMatch[2] || "1")
            const newStart = parseInt(hunkMatch[3])
            const newCount = parseInt(hunkMatch[4] || "1")
            oldLineNo = oldStart
            newLineNo = newStart
            currentHunk = {
                header: line,
                oldStart,
                oldCount,
                newStart,
                newCount,
                lines: [{ type: "header", content: line }],
            }
            continue
        }

        if (!currentHunk) continue

        if (line.startsWith("+")) {
            currentHunk.lines.push({
                type: "add",
                content: line.substring(1),
                newLineNo: newLineNo++,
            })
            if (currentFile) currentFile.additions++
        } else if (line.startsWith("-")) {
            currentHunk.lines.push({
                type: "remove",
                content: line.substring(1),
                oldLineNo: oldLineNo++,
            })
            if (currentFile) currentFile.deletions++
        } else if (line.startsWith(" ") || line === "") {
            currentHunk.lines.push({
                type: "context",
                content: line.startsWith(" ") ? line.substring(1) : line,
                oldLineNo: oldLineNo++,
                newLineNo: newLineNo++,
            })
        }
    }

    flushFile()
    return files
}

function FileDiffCard({ file, t }: { file: FileDiff; t: (key: string) => string }) {
    const [expanded, setExpanded] = useState(true)
    const [copied, setCopied] = useState(false)

    const copyFileDiff = () => {
        navigator.clipboard.writeText(file.rawContent)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="overflow-hidden">
            {/* File header */}
            <div
                className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-mono text-sm font-medium truncate">{file.fileName}</span>
                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {file.additions > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-300 dark:border-green-800 text-xs">
                            +{file.additions}
                        </Badge>
                    )}
                    {file.deletions > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-300 dark:border-red-800 text-xs">
                            -{file.deletions}
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            copyFileDiff()
                        }}
                        className="h-7 px-2"
                    >
                        {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                </div>
            </div>

            {/* Diff content */}
            {expanded && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono border-collapse">
                        <tbody>
                            {file.hunks.map((hunk, hi) =>
                                hunk.lines.map((line, li) => {
                                    if (line.type === "header") {
                                        return (
                                            <tr key={`${hi}-${li}`} className="bg-blue-50 dark:bg-blue-900/20">
                                                <td colSpan={3} className="px-4 py-1 text-blue-600 dark:text-blue-400 select-none">
                                                    {line.content}
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return (
                                        <tr
                                            key={`${hi}-${li}`}
                                            className={cn(
                                                line.type === "add" && "bg-green-50 dark:bg-green-900/15",
                                                line.type === "remove" && "bg-red-50 dark:bg-red-900/15",
                                                "hover:brightness-95 dark:hover:brightness-110"
                                            )}
                                        >
                                            <td className={cn(
                                                "w-[1px] whitespace-nowrap px-2 py-0.5 text-right select-none border-r",
                                                "text-muted-foreground/60",
                                                line.type === "add" && "border-green-200 dark:border-green-800/50",
                                                line.type === "remove" && "border-red-200 dark:border-red-800/50",
                                                line.type === "context" && "border-muted"
                                            )}>
                                                <span className="inline-block w-8 text-right">
                                                    {line.type !== "add" ? line.oldLineNo : ""}
                                                </span>
                                                <span className="inline-block w-8 text-right ml-1">
                                                    {line.type !== "remove" ? line.newLineNo : ""}
                                                </span>
                                            </td>
                                            <td className={cn(
                                                "w-[1px] px-2 select-none font-bold",
                                                line.type === "add" && "text-green-600 dark:text-green-400",
                                                line.type === "remove" && "text-red-600 dark:text-red-400"
                                            )}>
                                                {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                                            </td>
                                            <td className={cn(
                                                "px-2 py-0.5 whitespace-pre-wrap break-all",
                                                line.type === "add" && "text-green-800 dark:text-green-300",
                                                line.type === "remove" && "text-red-800 dark:text-red-300",
                                                line.type === "context" && "text-foreground/70"
                                            )}>
                                                {line.content}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}

export function GitDiffViewerTool() {
    const t = useTranslations("GitDiffViewer")
    const [input, setInput] = useState("")

    const files = useMemo(() => {
        if (!input.trim()) return []
        return parseDiff(input)
    }, [input])

    const totalAdditions = files.reduce((a, f) => a + f.additions, 0)
    const totalDeletions = files.reduce((a, f) => a + f.deletions, 0)

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card>
                <CardContent className="p-6">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("placeholder")}
                        className="font-mono text-sm min-h-[200px]"
                    />
                </CardContent>
            </Card>

            {/* Summary */}
            {files.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="secondary" className="text-sm">
                        {t("filesChanged", { count: files.length })}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300 dark:border-green-800">
                        +{totalAdditions} {t("additions")}
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-300 dark:border-red-800">
                        -{totalDeletions} {t("deletions")}
                    </Badge>
                </div>
            )}

            {/* File Diffs */}
            <div className="space-y-4">
                {files.map((file, i) => (
                    <FileDiffCard key={`${file.fileName}-${i}`} file={file} t={t} />
                ))}
            </div>

            {input.trim() && files.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        {t("noValidDiff")}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
