"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { AudioLines, Download, FileAudio, Loader2, Music, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import {
    BITRATES,
    buildAudioArgs,
    DEFAULT_BITRATE,
    DEFAULT_FORMAT,
    FORMATS,
    type AudioFormat,
    type Bitrate,
} from "./audio-converter.utils"

const FORMAT_KEYS = Object.keys(FORMATS) as AudioFormat[]

interface SourceAudio {
    file: File
    url: string
}

interface ResultAudio {
    url: string
    name: string
}

function extensionOf(name: string): string {
    const parts = name.split(".")
    return parts.length > 1 ? parts.pop()! : "dat"
}

export function AudioConverter() {
    const t = useTranslations("AudioConverter")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [source, setSource] = useState<SourceAudio | null>(null)
    const [result, setResult] = useState<ResultAudio | null>(null)
    const [format, setFormat] = useState<AudioFormat>(DEFAULT_FORMAT)
    const [bitrate, setBitrate] = useState<Bitrate>(DEFAULT_BITRATE)
    const [processing, setProcessing] = useState(false)

    const spec = FORMATS[format]

    // Load the shared FFmpeg core once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs when they change / on unmount to avoid leaks.
    useEffect(() => {
        return () => {
            if (source) URL.revokeObjectURL(source.url)
        }
    }, [source])

    useEffect(() => {
        return () => {
            if (result) URL.revokeObjectURL(result.url)
        }
    }, [result])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setSource((prev) => {
            if (prev) URL.revokeObjectURL(prev.url)
            return { file, url: URL.createObjectURL(file) }
        })
        setResult((prev) => {
            if (prev) URL.revokeObjectURL(prev.url)
            return null
        })
    }

    const clearSource = () => {
        setSource((prev) => {
            if (prev) URL.revokeObjectURL(prev.url)
            return null
        })
        setResult((prev) => {
            if (prev) URL.revokeObjectURL(prev.url)
            return null
        })
    }

    const handleConvert = async () => {
        if (!source || !loaded || processing) return
        setProcessing(true)
        try {
            const inputName = `input.${extensionOf(source.file.name)}`
            const outputName = `output.${spec.ext}`
            const args = buildAudioArgs({ inputName, outputName, format, bitrate })

            const blob = await run(inputName, source.file, args, outputName, spec.mime)

            const baseName = source.file.name.replace(/\.[^.]+$/, "") || "audio"
            const downloadName = `${baseName}.${spec.ext}`

            setResult((prev) => {
                if (prev) URL.revokeObjectURL(prev.url)
                return { url: URL.createObjectURL(blob), name: downloadName }
            })
            toast.success(t("success"))
        } catch (err) {
            console.error("Audio conversion error:", err)
            toast.error(t("convertError"))
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: source + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[280px] flex flex-col">
                    {!loaded && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loading")}</p>
                        </div>
                    )}

                    {!source ? (
                        <div className="relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                            <Input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                disabled={!loaded || loading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("inputPlaceholder")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">MP3, WAV, M4A, OGG, FLAC</p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseFile")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 flex flex-col items-center justify-center gap-6 p-8 m-1 rounded-xl bg-secondary/30 group">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-3 right-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={clearSource}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                                <AudioLines className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center space-y-1 w-full">
                                <p className="font-semibold truncate px-6">{source.file.name}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {t("sourceLabel")}
                                </p>
                            </div>
                            <audio src={source.url} controls className="w-full" />
                        </div>
                    )}
                </GlassCard>

                {result && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileAudio className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground truncate">{result.name}</p>
                            </div>
                        </div>
                        <audio src={result.url} controls className="w-full" />
                        <Button asChild size="lg" className="rounded-xl shadow-lg w-full">
                            <a href={result.url} download={result.name}>
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: options */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col relative">
                    {!source && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Music className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">{t("emptyHint")}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                            <Label className="text-base">{t("formatLabel")}</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMAT_KEYS.map((fmt) => (
                                    <div
                                        key={fmt}
                                        onClick={() => setFormat(fmt)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-3 text-center transition-all",
                                            format === fmt
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                        )}
                                    >
                                        <span className="font-mono font-bold uppercase block">{fmt}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {FORMATS[fmt].lossy ? t("lossy") : t("lossless")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base">{t("bitrateLabel")}</Label>
                            <Select
                                value={String(bitrate)}
                                onValueChange={(v) => setBitrate(Number(v) as Bitrate)}
                                disabled={!spec.lossy}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BITRATES.map((b) => (
                                        <SelectItem key={b} value={String(b)}>
                                            {b} kbps
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {spec.lossy ? t("bitrateHint") : t("bitrateNa")}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleConvert}
                            disabled={!source || !loaded || processing}
                        >
                            {processing ? <Loader2 className="animate-spin mr-2" /> : <AudioLines className="mr-2" />}
                            {t("convertAction")}
                        </Button>

                        {processing && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t("processing")}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
