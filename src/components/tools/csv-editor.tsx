"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Upload, Download, Plus, Trash2, Table, Copy, CheckCircle2, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function parseCSV(text: string): string[][] {
    const rows: string[][] = []
    const lines = text.split("\n")
    for (const line of lines) {
        if (!line.trim()) continue
        const cells: string[] = []
        let current = ""
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
                else inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
                cells.push(current)
                current = ""
            } else {
                current += char
            }
        }
        cells.push(current)
        rows.push(cells)
    }
    return rows
}

function toCSV(data: string[][]): string {
    return data.map(row =>
        row.map(cell => {
            if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
                return '"' + cell.replace(/"/g, '""') + '"'
            }
            return cell
        }).join(",")
    ).join("\n")
}

export function CsvEditor() {
    const t = useTranslations("CsvEditor")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [data, setData] = useState<string[][]>([
        ["Name", "Email", "Role"],
        ["John Doe", "john@example.com", "Admin"],
        ["Jane Smith", "jane@example.com", "User"],
        ["Bob Wilson", "bob@example.com", "Editor"],
    ])
    const [copied, setCopied] = useState(false)
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)

    const maxCols = Math.max(...data.map(r => r.length))

    const updateCell = (row: number, col: number, value: string) => {
        setData(prev => {
            const next = prev.map(r => [...r])
            while (next[row].length <= col) next[row].push("")
            next[row][col] = value
            return next
        })
    }

    const addRow = () => {
        setData(prev => [...prev, new Array(maxCols).fill("")])
    }

    const addColumn = () => {
        setData(prev => prev.map(row => [...row, ""]))
    }

    const deleteRow = (idx: number) => {
        if (data.length <= 1) return
        setData(prev => prev.filter((_, i) => i !== idx))
    }

    const deleteColumn = (idx: number) => {
        if (maxCols <= 1) return
        setData(prev => prev.map(row => row.filter((_, i) => i !== idx)))
    }

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const parsed = parseCSV(text)
            if (parsed.length > 0) {
                setData(parsed)
                toast.success(t("imported"))
            }
        }
        reader.readAsText(file)
    }

    const exportCSV = () => {
        const csv = toCSV(data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `data_${Date.now()}.csv`
        a.click()
        toast.success(t("exported"))
    }

    const copyCSV = () => {
        navigator.clipboard.writeText(toCSV(data))
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    const exportJSON = () => {
        if (data.length < 2) return
        const headers = data[0]
        const json = data.slice(1).map(row => {
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => { obj[h] = row[i] || "" })
            return obj
        })
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `data_${Date.now()}.json`
        a.click()
        toast.success(t("exported"))
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </header>

            {/* Toolbar */}
            <GlassCard className="p-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1">
                    <FileUp className="w-3 h-3" /> {t("importCsv")}
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.tsv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />

                <Button size="sm" onClick={exportCSV} className="gap-1">
                    <Download className="w-3 h-3" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportJSON} className="gap-1">
                    <Download className="w-3 h-3" /> JSON
                </Button>
                <Button variant="outline" size="sm" onClick={copyCSV} className="gap-1">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {t("copy")}
                </Button>

                <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={addColumn} className="gap-1">
                        <Plus className="w-3 h-3" /> {t("addColumn")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={addRow} className="gap-1">
                        <Plus className="w-3 h-3" /> {t("addRow")}
                    </Button>
                </div>
            </GlassCard>

            {/* Stats */}
            <GlassCard className="p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{t("rows")}:</span>
                        <span className="font-mono font-bold">{data.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("columns")}:</span>
                        <span className="font-mono font-bold">{maxCols}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("cells")}:</span>
                        <span className="font-mono font-bold">{data.length * maxCols}</span>
                    </div>
                </div>
            </GlassCard>

            {/* Table */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="w-10 bg-muted/50 border-b border-r border-border/20 p-2 text-xs text-muted-foreground">#</th>
                                {Array.from({ length: maxCols }).map((_, ci) => (
                                    <th key={ci} className="bg-muted/50 border-b border-r border-border/20 p-0 min-w-[140px] group">
                                        <div className="flex items-center">
                                            <input
                                                value={data[0]?.[ci] || ""}
                                                onChange={e => updateCell(0, ci, e.target.value)}
                                                className="w-full bg-transparent px-3 py-2 text-xs font-bold outline-none"
                                                placeholder={`Column ${ci + 1}`}
                                            />
                                            <button
                                                onClick={() => deleteColumn(ci)}
                                                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(1).map((row, ri) => (
                                <tr key={ri} className="group hover:bg-muted/20">
                                    <td className="border-b border-r border-border/20 p-2 text-xs text-muted-foreground text-center bg-muted/30">
                                        <div className="flex items-center justify-center gap-1">
                                            <span>{ri + 1}</span>
                                            <button
                                                onClick={() => deleteRow(ri + 1)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    {Array.from({ length: maxCols }).map((_, ci) => (
                                        <td key={ci} className="border-b border-r border-border/20 p-0">
                                            <input
                                                value={row[ci] || ""}
                                                onChange={e => updateCell(ri + 1, ci, e.target.value)}
                                                onFocus={() => setEditingCell({ row: ri + 1, col: ci })}
                                                onBlur={() => setEditingCell(null)}
                                                className={`w-full bg-transparent px-3 py-2 text-sm outline-none transition-colors ${
                                                    editingCell?.row === ri + 1 && editingCell?.col === ci
                                                        ? "bg-primary/5 ring-2 ring-primary/30 ring-inset"
                                                        : ""
                                                }`}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    )
}
