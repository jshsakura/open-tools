"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, File, X, ChevronUp, ChevronDown, Download, Layers } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PdfMerge() {
    const t = useTranslations("PdfMerge")
    const [files, setFiles] = useState<File[]>([])
    const [isMerging, setIsMerging] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf")
            setFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files]
        if (direction === 'up' && index > 0) {
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
        }
        setFiles(newFiles)
    }

    const mergePdfs = async () => {
        if (files.length < 2) {
            toast.error(t("error"), { description: "Please select at least 2 PDF files." })
            return
        }

        setIsMerging(true)
        try {
            const mergedPdf = await PDFDocument.create()

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer()
                const pdf = await PDFDocument.load(arrayBuffer)
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                copiedPages.forEach((page) => mergedPdf.addPage(page))
            }

            const pdfBytes = await mergedPdf.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "merged_document.pdf"
            link.click()
            URL.revokeObjectURL(url)
            toast.success(t("success"))
        } catch (error) {
            console.error(error)
            toast.error(t("error"))
        } finally {
            setIsMerging(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-500" />
                    {t("title")}
                </CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                    <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">{t("dropTitle")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("dropDesc")}</p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{t("count", { count: files.length })}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                                {t("clear")}
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-red-500/10 rounded">
                                            <File className="h-4 w-4 text-red-500" />
                                        </div>
                                        <span className="text-sm truncate max-w-[200px] md:max-w-md">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            className="h-8 w-8"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            className="h-8 w-8"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(index)}
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button onClick={mergePdfs} disabled={files.length < 2 || isMerging} size="lg" className="gap-2">
                        {isMerging ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                {t("merge")}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
