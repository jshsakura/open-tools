"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Copy, Check, FileJson, FileSpreadsheet, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import Papa from "papaparse"

export function JsonConverter() {
    const t = useTranslations("DataTools")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [mode, setMode] = useState<"json-to-csv" | "csv-to-json" | "json-to-excel">("json-to-csv")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [copied, setCopied] = useState(false)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result
            if (typeof content === "string") {
                // If it's Excel (binary), need array buffer but here we just handle text for JSON/CSV
                // For simplified upload, let's stick to text for JSON/CSV
                setInput(content)
            } else if (content instanceof ArrayBuffer) {
                // Handle Excel upload logic if needed later
                const wb = XLSX.read(content)
                const ws = wb.Sheets[wb.SheetNames[0]]
                const data = XLSX.utils.sheet_to_json(ws)
                setInput(JSON.stringify(data, null, 2))
            }
        }

        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            reader.readAsArrayBuffer(file)
        } else {
            reader.readAsText(file)
        }
    }

    const convert = () => {
        if (!input) {
            toast.error(t("JsonConverter.errorEmpty"))
            return
        }

        try {
            if (mode === "json-to-csv") {
                const jsonData = JSON.parse(input)
                const csv = Papa.unparse(jsonData)
                setOutput(csv)
                toast.success(t("JsonConverter.successConverted"))
            } else if (mode === "csv-to-json") {
                const result = Papa.parse(input, { header: true })
                if (result.errors.length > 0) throw new Error(result.errors[0].message)
                setOutput(JSON.stringify(result.data, null, 2))
                toast.success(t("JsonConverter.successConverted"))
            } else if (mode === "json-to-excel") {
                const jsonData = JSON.parse(input)
                if (!Array.isArray(jsonData)) throw new Error("JSON must be an array of objects")

                const ws = XLSX.utils.json_to_sheet(jsonData)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
                XLSX.writeFile(wb, "converted_data.xlsx")
                toast.success(t("JsonConverter.successDownload"))
            }
        } catch (e: any) {
            console.error(e)
            toast.error(t("JsonConverter.errorConvert") + ": " + e.message)
        }
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("JsonConverter.itemCopied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="json-to-csv">JSON → CSV</SelectItem>
                        <SelectItem value="csv-to-json">CSV → JSON</SelectItem>
                        <SelectItem value="json-to-excel">JSON → Excel (Download)</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json,.csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {t("JsonConverter.uploadFile")}
                    </Button>
                    <Button onClick={convert}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("JsonConverter.convert")}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 h-[500px]">
                <div className="flex flex-col gap-2 h-full">
                    <Label>{t("JsonConverter.inputsLabel")}</Label>
                    <Textarea
                        className="flex-1 font-mono text-xs resize-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("JsonConverter.inputPlaceholder")}
                    />
                </div>
                <div className="flex flex-col gap-2 h-full">
                    <div className="flex justify-between items-center">
                        <Label>{t("JsonConverter.outputLabel")}</Label>
                        <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={!output}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Textarea
                        className="flex-1 font-mono text-xs resize-none bg-muted"
                        value={output}
                        readOnly
                        placeholder={t("JsonConverter.outputPlaceholder")}
                    />
                </div>
            </div>
        </div>
    )
}
