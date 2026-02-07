"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUp, File, X, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
// @ts-ignore
// import { Viewer } from "hwp.js"

export function HwpViewer() {
    const t = useTranslations("HwpViewer")
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
        // HWP detection is tricky by mime type, so we check extension
        if (!selectedFile.name.toLowerCase().endsWith('.hwp')) {
            toast.error("Invalid file type", { description: "Please upload a .hwp file." })
            return
        }
        setFile(selectedFile)
        setIsProcessing(true)

        try {
            const arrayBuffer = await selectedFile.arrayBuffer()
            const data = new Uint8Array(arrayBuffer)

            if (viewerRef.current) {
                viewerRef.current.innerHTML = '' // Clear previous
                // new Viewer(viewerRef.current, data, { type: 'array' })
                toast.error("HWP Viewer is temporarily disabled due to a build issue.")
            }
        } catch (error) {
            console.error(error)
            toast.error(t("error"), { description: "Could not parse this HWP file." })
            setFile(null)
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
                            {t("title")}
                        </CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
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
                            onClick={() => document.getElementById("hwp-upload")?.click()}
                        >
                            <input
                                id="hwp-upload"
                                type="file"
                                accept=".hwp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-1">{t("dropTitle")}</p>
                            <p className="text-sm text-muted-foreground">Support .hwp files</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="shrink-0 flex items-center justify-between p-2 bg-muted/20 border-b text-sm px-4">
                            <span className="font-medium flex items-center gap-2">
                                <File className="h-4 w-4" /> {file.name}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); if (viewerRef.current) viewerRef.current.innerHTML = ''; }} className="h-6 w-6 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto bg-white p-8 shadow-inner relative" >
                            <div ref={viewerRef} className="min-h-full" />
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
