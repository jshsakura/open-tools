"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
    Upload,
    Rewind,
    Download,
    Loader2,
    X,
    FileVideo,
    AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildReverseArgs } from "./video-reverse.utils"

const OUTPUT_NAME = "reversed.mp4"
const OUTPUT_MIME = "video/mp4"

export function VideoReverse() {
    const t = useTranslations("VideoReverse")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)
    const [reverseAudio, setReverseAudio] = useState(true)

    const videoRef = useRef<HTMLVideoElement>(null)

    // Load FFmpeg once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs to avoid leaks.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        return () => {
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
    }, [resultUrl])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setVideoFile(file)
        setPreviewUrl(url)
        setResultUrl(null)
    }

    const clearFile = () => {
        setVideoFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
    }

    const handleReverse = async () => {
        if (!videoFile || !loaded) return

        setProcessing(true)
        setResultUrl(null)

        try {
            const ext = videoFile.name.split(".").pop() || "mp4"
            const inputName = `input.${ext}`
            const args = buildReverseArgs({
                inputName,
                outputName: OUTPUT_NAME,
                reverseAudio,
            })

            const blob = await run(inputName, videoFile, args, OUTPUT_NAME, OUTPUT_MIME)
            const url = URL.createObjectURL(blob)
            setResultUrl(url)
            toast.success(t("done"))
        } catch (err) {
            console.error("Video reverse error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    const isBusy = loading || !loaded

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: Upload / Preview / Result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    {isBusy && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loading")}</p>
                        </div>
                    )}

                    {!videoFile ? (
                        <div className="relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("uploadTitle")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {t("uploadHint")}
                                    </p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseVideo")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video
                                ref={videoRef}
                                src={previewUrl ?? undefined}
                                className="w-full h-full object-contain"
                                controls
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
                        <div className="rounded-xl overflow-hidden bg-black">
                            <video
                                src={resultUrl}
                                className="w-full max-h-64 object-contain"
                                controls
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileVideo className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground">{OUTPUT_NAME}</p>
                            </div>
                            <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
                                <a href={resultUrl} download={OUTPUT_NAME}>
                                    <Download className="mr-2 h-5 w-5" />
                                    {t("download")}
                                </a>
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Right: Reverse controls */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl p-6 flex flex-col gap-8 relative">
                    {!videoFile && (
                        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <Rewind className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    {t("selectPrompt")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Heading */}
                    <div className="space-y-2">
                        <Label className="text-base flex items-center gap-2">
                            <Rewind className="w-5 h-5 text-primary" />
                            {t("optionsTitle")}
                        </Label>
                        <p className="text-sm text-muted-foreground">{t("optionsHint")}</p>
                    </div>

                    {/* Short-clip warning */}
                    <div className="flex gap-3 items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{t("memoryWarning")}</p>
                    </div>

                    {/* Reverse-audio toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4">
                        <div className="pr-4">
                            <Label className="text-base">{t("reverseAudioLabel")}</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                {reverseAudio
                                    ? t("reverseAudioOnHint")
                                    : t("reverseAudioOffHint")}
                            </p>
                        </div>
                        <Switch
                            checked={reverseAudio}
                            onCheckedChange={setReverseAudio}
                        />
                    </div>

                    {/* Action */}
                    <div className="mt-auto">
                        <Button
                            className="w-full h-14 text-lg rounded-xl shadow-lg"
                            onClick={handleReverse}
                            disabled={!videoFile || processing || !loaded}
                        >
                            {processing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <Rewind className="mr-2" />
                            )}
                            {t("reverseAction")}
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
