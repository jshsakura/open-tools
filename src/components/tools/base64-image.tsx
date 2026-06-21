"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ClipboardPasteButton } from "@/components/clipboard-paste-button"
import {
    ImageIcon,
    Copy,
    CheckCircle2,
    Trash2,
    Eye,
    Maximize2,
    Download,
    Info,
    AlertCircle,
    Upload
} from "lucide-react"
import { toast } from "sonner"

const MAX_ENCODE_BYTES = 12 * 1024 * 1024

type Mode = "decode" | "encode"

export function Base64ImageTool() {
    const t = useTranslations('Base64Image')

    const [mode, setMode] = useState<Mode>("decode")

    // Decode state
    const [input, setInput] = useState("")
    const [metadata, setMetadata] = useState<{ size: string, format: string } | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Encode state
    const [encodedUri, setEncodedUri] = useState("")
    const [encodePreview, setEncodePreview] = useState<string | null>(null)
    const [encodeName, setEncodeName] = useState("")
    const [copied, setCopied] = useState(false)

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleProcess = () => {
        setError(null)
        setMetadata(null)

        if (!input.trim()) return

        try {
            const base64String = input.trim()

            if (base64String.startsWith("data:")) {
                const match = base64String.match(/^data:image\/([a-zA-Z+]+);base64,/)
                if (match) {
                    setMetadata({
                        format: match[1].toUpperCase(),
                        size: formatBytes(atob(base64String.split(',')[1]).length)
                    })
                }
            } else {
                setMetadata({
                    format: "Unknown",
                    size: formatBytes(atob(base64String).length)
                })
            }
        } catch {
            setError(t('invalidBase64'))
        }
    }

    const downloadImage = () => {
        const link = document.createElement("a")
        link.href = input.startsWith("data:") ? input : `data:image/png;base64,${input}`
        link.download = `decoded-image.${metadata?.format.toLowerCase() || 'png'}`
        link.click()
    }

    const clearDecode = () => {
        setInput("")
        setMetadata(null)
        setError(null)
    }

    // Encode: read an image File into a data-URI
    const handleEncodeFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error(t('encodeInvalidType'))
            return
        }
        if (file.size > MAX_ENCODE_BYTES) {
            toast.error(t('encodeTooLarge'))
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : ""
            setEncodedUri(result)
            setEncodePreview(result)
            setEncodeName(file.name)
        }
        reader.onerror = () => {
            toast.error(t('encodeReadFailed'))
        }
        reader.readAsDataURL(file)
    }

    const handleEncodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleEncodeFile(file)
    }

    const copyEncoded = async (raw: boolean) => {
        if (!encodedUri) return
        const value = raw ? encodedUri.split(",")[1] ?? encodedUri : encodedUri
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            toast.success(t('copied'))
            setTimeout(() => setCopied(false), 1500)
        } catch {
            toast.error(t('copyFailed'))
        }
    }

    const clearEncode = () => {
        setEncodedUri("")
        setEncodePreview(null)
        setEncodeName("")
        setCopied(false)
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
                <TabsList className="mx-auto">
                    <TabsTrigger value="encode">{t('encodeTab')}</TabsTrigger>
                    <TabsTrigger value="decode">{t('decodeTab')}</TabsTrigger>
                </TabsList>

                {/* ENCODE: image -> base64 */}
                <TabsContent value="encode" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Source Panel */}
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-purple-500" />
                                        {t('imageSource')}
                                    </CardTitle>
                                    <CardDescription>{t('uploadOrPaste')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={clearEncode} className="text-muted-foreground/50 hover:text-rose-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
                                {encodePreview ? (
                                    <div className="max-w-full max-h-[300px] rounded-2xl overflow-hidden border border-border/20 shadow-2xl bg-white p-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={encodePreview}
                                            alt="Source"
                                            className="max-w-full max-h-[280px] object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <div className="p-6 rounded-[32px] bg-secondary border border-border/10">
                                            <Upload className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">
                                            {t('noImageYet')}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 justify-center">
                                    <label>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            className="hidden"
                                            onChange={handleEncodeInput}
                                        />
                                        <Button asChild variant="secondary" className="rounded-xl gap-2 font-bold cursor-pointer">
                                            <span>
                                                <Upload className="h-4 w-4" />
                                                {t('uploadImage')}
                                            </span>
                                        </Button>
                                    </label>
                                    <ClipboardPasteButton onImageFile={handleEncodeFile} size="default" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Output Panel */}
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Maximize2 className="h-5 w-5 text-primary" />
                                        {t('base64Output')}
                                    </CardTitle>
                                    <CardDescription>{t('dataUriOutput')}</CardDescription>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="rounded-xl gap-2 font-bold h-9"
                                    disabled={!encodedUri}
                                    onClick={() => copyEncoded(false)}
                                >
                                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    {t('copyDataUri')}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                                <Textarea
                                    readOnly
                                    value={encodedUri}
                                    placeholder={t('outputPlaceholder')}
                                    className="flex-1 min-h-[320px] font-mono text-[12px] bg-background/50 border-primary/10"
                                />
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        className="flex-1 h-12 rounded-2xl gap-2 font-bold shadow-lg"
                                        disabled={!encodedUri}
                                        onClick={() => copyEncoded(false)}
                                    >
                                        <Copy className="h-4 w-4" />
                                        {t('copyDataUri')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-2xl gap-2 font-bold"
                                        disabled={!encodedUri}
                                        onClick={() => copyEncoded(true)}
                                    >
                                        <Copy className="h-4 w-4" />
                                        {t('copyRawBase64')}
                                    </Button>
                                </div>
                                {encodeName && (
                                    <p className="text-xs text-muted-foreground truncate">{encodeName}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* DECODE: base64 -> image */}
                <TabsContent value="decode" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Input Panel */}
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-purple-500" />
                                        {t('base64Input')}
                                    </CardTitle>
                                    <CardDescription>{t('pasteDataUri')}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={clearDecode} className="text-muted-foreground/50 hover:text-rose-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                                <Textarea
                                    placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onBlur={handleProcess}
                                    className="flex-1 min-h-[400px] font-mono text-[12px] bg-background/50 border-primary/10 transition-all focus-visible:ring-primary focus-visible:ring-offset-0"
                                />
                                {error && (
                                    <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in shake">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                                <Button className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg" onClick={handleProcess}>
                                    <Eye className="h-4 w-4" />
                                    {t('decodePreview')}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview Panel */}
                        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl flex flex-col relative overflow-hidden group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/10 bg-muted/30 relative z-10">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Maximize2 className="h-5 w-5 text-primary" />
                                        {t('imagePreview')}
                                    </CardTitle>
                                    <CardDescription>{t('visualOutput')}</CardDescription>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="rounded-xl gap-2 font-bold h-9"
                                    disabled={!metadata || !!error}
                                    onClick={downloadImage}
                                >
                                    <Download className="h-4 w-4" />
                                    {t('save')}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center relative z-10">
                                {input && !error ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6">
                                        <div className="max-w-full max-h-[360px] rounded-2xl overflow-hidden border border-border/20 shadow-2xl bg-white p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={input.startsWith("data:") ? input : `data:image/png;base64,${input}`}
                                                alt="Base64 Preview"
                                                className="max-w-full max-h-[340px] object-contain"
                                            />
                                        </div>
                                        {metadata && (
                                            <div className="flex gap-3">
                                                <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest">
                                                    {metadata.format}
                                                </div>
                                                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                                                    {metadata.size}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                                        <div className="p-6 rounded-[32px] bg-secondary border border-border/10">
                                            <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t('previewUnavailable')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Hint */}
            <div className="flex items-center gap-3 p-6 rounded-[24px] bg-secondary/20 border border-border/10">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Info className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.rich('noteDesc', {
                        code: (chunks) => <code>{chunks}</code>
                    })}
                </p>
            </div>
        </div>
    )
}
