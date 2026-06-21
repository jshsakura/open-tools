"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Upload, Video, Download, Loader2, X, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildGifToVideoArgs, FORMATS, type GifVideoFormat } from "./gif-to-video.utils"

const FORMAT_OPTIONS: GifVideoFormat[] = ["mp4", "webm"]
const DEFAULT_FORMAT: GifVideoFormat = "mp4"
/** Loop options: -1 = once (no extra loop), 0 = forever, N = repeat N times. */
const LOOP_OPTIONS = ["-1", "0", "2", "4"] as const
const DEFAULT_LOOP = "-1"

export function GifToVideo() {
    const t = useTranslations("GifToVideo")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [gifFile, setGifFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const [format, setFormat] = useState<GifVideoFormat>(DEFAULT_FORMAT)
    const [loop, setLoop] = useState<string>(DEFAULT_LOOP)

    // Load FFmpeg core lazily on mount.
    useEffect(() => {
        let cancelled = false
        load().then((ok) => {
            if (!ok && !cancelled) toast.error(t("loadError"))
        })
        return () => {
            cancelled = true
        }
    }, [load, t])

    // Revoke object URLs on unmount to avoid leaks.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (resultUrl) URL.revokeObjectURL(resultUrl)

        setGifFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setResultUrl(null)
    }

    const clearFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setGifFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
    }

    const handleConvert = async () => {
        if (!gifFile || !loaded || processing) return
        setProcessing(true)

        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }

        try {
            const spec = FORMATS[format]
            const inputName = "input.gif"
            const outputName = `output.${spec.ext}`
            const args = buildGifToVideoArgs({
                inputName,
                outputName,
                format,
                loop: Number(loop),
            })

            const blob = await run(inputName, gifFile, args, outputName, spec.mime)
            setResultUrl(URL.createObjectURL(blob))
            toast.success(t("success"))
        } catch (err) {
            console.error("GIF to video conversion error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const downloadName = `output.${FORMATS[format].ext}`
    const isBusy = loading || !loaded

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: source preview / upload + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                    {isBusy && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loadingFfmpeg")}</p>
                        </div>
                    )}

                    {!gifFile ? (
                        <div className="relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                            <Input
                                type="file"
                                accept="image/gif"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("uploadTitle")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">{t("uploadHint")}</p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseGif")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl!}
                                alt={t("uploadTitle")}
                                className="w-full h-full object-contain"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={clearFile}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {resultUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <FileVideo className="w-5 h-5" />
                            {t("resultTitle")}
                        </div>
                        <div className="rounded-xl overflow-hidden bg-black">
                            <video
                                src={resultUrl}
                                className="w-full max-h-64 object-contain"
                                controls
                                autoPlay
                                loop
                                muted
                            />
                        </div>
                        <Button asChild size="lg" className="w-full rounded-xl shadow-lg">
                            <a href={resultUrl} download={downloadName}>
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: options */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base">{t("formatLabel")}</Label>
                        <Select
                            value={format}
                            onValueChange={(value) => setFormat(value as GifVideoFormat)}
                            disabled={!gifFile || processing}
                        >
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAT_OPTIONS.map((f) => (
                                    <SelectItem key={f} value={f}>
                                        {t(`format_${f}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground text-right">{t("formatHint")}</p>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base">{t("loopLabel")}</Label>
                        <Select
                            value={loop}
                            onValueChange={setLoop}
                            disabled={!gifFile || processing}
                        >
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LOOP_OPTIONS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {t(`loop_${value}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground text-right">{t("loopHint")}</p>
                    </div>

                    <div className="mt-auto pt-4">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleConvert}
                            disabled={!gifFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Video className="mr-2" />
                            )}
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
