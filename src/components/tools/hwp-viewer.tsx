"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, File as FileIcon, X, FileText, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { renderAsync } from "docx-preview"
import * as XLSX from "xlsx"

export function DocumentViewer() {
    const t = useTranslations("HwpViewer") // Keep using HwpViewer namespace or migrate to DocumentViewer
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const viewerRef = useRef<HTMLDivElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const processFile = async (selectedFile: File) => {
        const fileName = selectedFile.name.toLowerCase()
        const isHwp = fileName.endsWith('.hwp')
        const isDocx = fileName.endsWith('.docx')
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

        if (!isHwp && !isDocx && !isExcel) {
            toast.error(t('invalidFileType'), { description: t('invalidFileDesc') })
            return
        }

        setFile(selectedFile)
        setIsProcessing(true)

        // Clear previous content
        if (viewerRef.current) {
            viewerRef.current.innerHTML = ''
        }

        try {
            const arrayBuffer = await selectedFile.arrayBuffer()

            if (isDocx) {
                if (viewerRef.current) {
                    await renderAsync(arrayBuffer, viewerRef.current, viewerRef.current, {
                        className: "docx-viewer",
                        inWrapper: true,
                        ignoreWidth: false,
                        ignoreHeight: false,
                        ignoreFonts: false,
                        breakPages: true,
                        ignoreLastRenderedPageBreak: true,
                        experimental: false,
                        trimXmlDeclaration: true,
                        useBase64URL: false,
                        debug: false,
                    })
                }
            } else if (isHwp) {
                toast.error(t('hwpDisabled'))
            } else if (isExcel) {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]
                const html = XLSX.utils.sheet_to_html(worksheet, { id: "excel-table", editable: false })

                if (viewerRef.current) {
                    viewerRef.current.innerHTML = `
                        <style>
                            table { border-collapse: collapse; width: 100%; font-size: 14px; }
                            td, th { border: 1px solid #e2e8f0; padding: 8px; white-space: nowrap; }
                            tr:nth-child(even){background-color: #f8fafc;}
                            th { padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #f1f5f9; color: #0f172a; font-weight: 600; }
                            .excel-viewer { overflow-x: auto; width: 100%; height: 100%; }
                        </style>
                        <div class="excel-viewer">
                            ${html}
                        </div>
                    `
                }
            }

            toast.success(t('documentLoaded'))
        } catch (error) {
            console.error(error)
            toast.error(t('failedToLoad'), { description: t('couldNotParse') })
            setFile(null)
            if (viewerRef.current) viewerRef.current.innerHTML = ''
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto h-[80vh] flex flex-col">
            <CardHeader className="border-b bg-muted/30 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            {t("viewerTitle")}
                        </CardTitle>
                        <CardDescription>{t("viewerDescription")}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden relative">
                {!file ? (
                    <div className="h-full flex items-center justify-center p-6">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:bg-muted/30 transition-colors cursor-pointer w-full max-w-lg"
                            onClick={() => document.getElementById("doc-upload")?.click()}
                        >
                            <input
                                id="doc-upload"
                                type="file"
                                accept=".hwp,.docx,.xlsx,.xls"
                                className="hidden"
                                onChange={handleFileChange}
                             />
                             <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                             <p className="text-lg font-medium mb-1">{t('uploadDocument')}</p>
                             <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
                         </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="shrink-0 flex items-center justify-between p-2 bg-muted/20 border-b text-sm px-4">
                            <span className="font-medium flex items-center gap-2">
                                <FileIcon className="h-4 w-4" /> {file.name}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); if (viewerRef.current) viewerRef.current.innerHTML = ''; }} className="h-6 w-6 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto bg-white p-8 shadow-inner relative" >
                            {/* Container for document content */}
                            <div ref={viewerRef} className="min-h-full doc-container" />

                             {isProcessing && (
                                 <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                                     <div className="flex flex-col items-center gap-2">
                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                         <p className="text-sm text-muted-foreground">{t('renderingDocument')}</p>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
