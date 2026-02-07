"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileUp, File, X, Image as ImageIcon, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export function PdfToImage() {
    const t = useTranslations("PdfToImage")
    const [file, setFile] = useState<File | null>(null)
    const [format, setFormat] = useState<"png" | "jpeg">("png")
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [pdfJs, setPdfJs] = useState<any>(null)

    useEffect(() => {
        // Dynamically import pdfjs-dist
        const loadPdfJs = async () => {
            try {
                const pdfjsLib = await import("pdfjs-dist")
                // Setup worker
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
                setPdfJs(pdfjsLib)
            } catch (e) {
                console.error("Failed to load pdfjs-dist", e)
                toast.error("Component initialization failed. Please refresh.")
            }
        }
        loadPdfJs()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type !== "application/pdf") {
                toast.error("Invalid file type", { description: "Please upload a PDF file." })
                return
            }
            setFile(selectedFile)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0]
            if (selectedFile.type !== "application/pdf") {
                toast.error("Invalid file type", { description: "Please upload a PDF file." })
                return
            }
            setFile(selectedFile)
        }
    }

    const convertToImages = async () => {
        if (!file || !pdfJs) return

        setIsProcessing(true)
        setProgress(0)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfJs.getDocument({ data: arrayBuffer }).promise
            const totalPages = pdf.numPages
            const zip = new JSZip()

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale: 2.0 }) // High quality scale

                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")
                canvas.height = viewport.height
                canvas.width = viewport.width

                if (context) {
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise

                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, `image/${format}`))
                    if (blob) {
                        zip.file(`page_${i}.${format}`, blob)
                    }
                }
                setProgress(Math.round((i / totalPages) * 100))
            }

            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, `${file.name.replace('.pdf', '')}_images.zip`)
            toast.success(t("success"))

        } catch (error) {
            console.error(error)
            toast.error(t("error"))
        } finally {
            setIsProcessing(false)
            setProgress(0)
        }
    }


    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
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
                                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label>{t("format")}</Label>
                            <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpeg")}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                                    <SelectItem value="jpeg">JPG (Smaller Size)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-center text-muted-foreground">Converting... {progress}%</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button onClick={convertToImages} disabled={isProcessing} size="lg" className="gap-2">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        {t("convert")}
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
