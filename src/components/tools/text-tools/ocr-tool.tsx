"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Copy, Check, RotateCw, Loader2, ScanText } from "lucide-react"
import { toast } from "sonner"
import Tesseract from "tesseract.js"

export function OcrTool() {
    const t = useTranslations("TextTools.OcrTool")
    const [image, setImage] = useState<string | null>(null)
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [language, setLanguage] = useState("eng")
    const [copied, setCopied] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result as string
            setImage(result)
            setText("") // Clear previous text
        }
        reader.readAsDataURL(file)
    }

    const processImage = async () => {
        if (!image) {
            toast.error(t("errorNoImage"))
            return
        }

        setLoading(true)
        setProgress(0)

        try {
            const result = await Tesseract.recognize(
                image,
                language,
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100))
                        }
                    }
                }
            )
            setText(result.data.text)
            toast.success(t("success"))
        } catch (error) {
            console.error(error)
            toast.error(t("error"))
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>{t("inputLabel")}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="eng">English</SelectItem>
                            <SelectItem value="kor">Korean</SelectItem>
                            <SelectItem value="jpn">Japanese</SelectItem>
                            <SelectItem value="chi_sim">Chinese</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative border-2 border-dashed rounded-xl p-4 min-h-[300px] flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => !image && fileInputRef.current?.click()}
                >
                    {image ? (
                        <>
                            <img src={image} alt="Preview" className="max-h-[400px] w-auto object-contain rounded-lg shadow-sm" />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setImage(null)
                                    setText("")
                                }}
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="text-center space-y-2">
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">{t("dropLabel")}</p>
                            <p className="text-xs text-muted-foreground/70">{t("dropSub")}</p>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    onClick={processImage}
                    disabled={!image || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("processing")} {progress}%
                        </>
                    ) : (
                        <>
                            <ScanText className="mr-2 h-4 w-4" />
                            {t("processButton")}
                        </>
                    )}
                </Button>
            </div>

            <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                    <Label>{t("outputLabel")}</Label>
                    <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={!text}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <Textarea
                    className="flex-1 font-mono text-sm resize-none bg-muted min-h-[350px]"
                    value={text}
                    readOnly
                    placeholder={t("outputPlaceholder")}
                />
            </div>
        </div>
    )
}
