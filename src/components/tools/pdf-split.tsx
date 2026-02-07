"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, File, X, Scissors, Download, AlertCircle } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { toast } from "sonner"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export function PdfSplit() {
    const t = useTranslations("PdfSplit")
    const [file, setFile] = useState<File | null>(null)
    const [pageRange, setPageRange] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null)
    const [totalPages, setTotalPages] = useState(0)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type !== "application/pdf") {
                toast.error("Invalid file type", { description: "Please upload a PDF file." })
                return
            }
            setFile(selectedFile)

            try {
                const arrayBuffer = await selectedFile.arrayBuffer()
                const doc = await PDFDocument.load(arrayBuffer)
                setPdfDoc(doc)
                setTotalPages(doc.getPageCount())
            } catch (error) {
                console.error(error)
                toast.error(t("error"))
                setFile(null)
            }
        }
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0]
            if (selectedFile.type !== "application/pdf") {
                toast.error("Invalid file type", { description: "Please upload a PDF file." })
                return
            }
            setFile(selectedFile)

            try {
                const arrayBuffer = await selectedFile.arrayBuffer()
                const doc = await PDFDocument.load(arrayBuffer)
                setPdfDoc(doc)
                setTotalPages(doc.getPageCount())
            } catch (error) {
                console.error(error)
                toast.error(t("error"))
                setFile(null)
            }
        }
    }

    const parsePageRange = (range: string, maxPages: number): number[] => {
        const pages = new Set<number>()
        const parts = range.split(',')

        for (const part of parts) {
            const trimmed = part.trim()
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number)
                if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
                    for (let i = start; i <= end; i++) {
                        pages.add(i - 1) // 0-indexed
                    }
                }
            } else {
                const page = Number(trimmed)
                if (!isNaN(page) && page > 0 && page <= maxPages) {
                    pages.add(page - 1) // 0-indexed
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b)
    }

    const splitPdf = async () => {
        if (!file || !pdfDoc) return

        if (!pageRange) {
            toast.error("Please enter a page range.")
            return
        }

        const selectedPageIndices = parsePageRange(pageRange, totalPages)

        if (selectedPageIndices.length === 0) {
            toast.error("Invalid page range", { description: `Please enter valid pages (1-${totalPages}).` })
            return
        }

        setIsProcessing(true)
        try {
            const newPdf = await PDFDocument.create()
            const copiedPages = await newPdf.copyPages(pdfDoc, selectedPageIndices)
            copiedPages.forEach(page => newPdf.addPage(page))

            const pdfBytes = await newPdf.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })

            saveAs(blob, `split_${file.name.replace('.pdf', '')}_${pageRange.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
            toast.success(t("success"))
        } catch (error) {
            console.error(error)
            toast.error(t("error"))
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-rose-500" />
                    {t("title")}
                </CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {!file ? (
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
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium">{t("dropTitle")}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <File className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-muted-foreground">{totalPages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPdfDoc(null); setPageRange(""); }}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="page-range">{t("pageRange")}</Label>
                            <Input
                                id="page-range"
                                placeholder={`e.g. 1-3, 5, 7-${totalPages}`}
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Enter page numbers/ranges to extract into a new PDF.
                            </p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button onClick={splitPdf} disabled={isProcessing || !pageRange} size="lg" className="gap-2">
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        {t("split")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
