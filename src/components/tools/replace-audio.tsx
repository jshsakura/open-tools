"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { fetchFile } from "@ffmpeg/util"
import {
    Upload,
    Video,
    Music,
    Download,
    Loader2,
    X,
    FileVideo,
    AudioLines,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildReplaceArgs } from "./replace-audio.utils"

const OUTPUT_NAME = "output.mp4"
const OUTPUT_MIME = "video/mp4"

/** Derive a virtual FS input name preserving the source extension. */
function inputNameFor(file: File, fallbackExt: string, label: string): string {
    const ext = file.name.split(".").pop()?.toLowerCase() || fallbackExt
    return `${label}.${ext}`
}

export function ReplaceAudio() {
    const t = useTranslations("ReplaceAudio")
    const { ffmpeg, load, loaded, loading, progress } = useFfmpeg()

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [resultName, setResultName] = useState("")
    const [processing, setProcessing] = useState(false)

    const [mix, setMix] = useState(false)
    const [bgmVolume, setBgmVolume] = useState(1)

    const videoUrlRef = useRef<string | null>(null)
    const resultUrlRef = useRef<string | null>(null)

    // Load FFmpeg once on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    // Revoke object URLs on unmount.
    useEffect(() => {
        return () => {
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
        }
    }, [])

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)

        const url = URL.createObjectURL(file)
        videoUrlRef.current = url
        resultUrlRef.current = null

        setVideoFile(file)
        setVideoUrl(url)
        setResultUrl(null)
        setResultName("")
    }

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
        resultUrlRef.current = null
        setAudioFile(file)
        setResultUrl(null)
        setResultName("")
    }

    const clearVideo = () => {
        if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
        videoUrlRef.current = null
        resultUrlRef.current = null
        setVideoFile(null)
        setVideoUrl(null)
        setResultUrl(null)
        setResultName("")
    }

    const replace = async () => {
        if (!videoFile || !audioFile || !loaded || processing) return
        const ff = ffmpeg.current
        if (!ff) return

        setProcessing(true)

        const videoName = inputNameFor(videoFile, "mp4", "video")
        const audioName = inputNameFor(audioFile, "mp3", "audio")

        try {
            await ff.writeFile(videoName, await fetchFile(videoFile))
            await ff.writeFile(audioName, await fetchFile(audioFile))

            // In mix mode the video might have no audio stream; amix would then
            // fail. Try mixing first and fall back to a plain replace if it errors.
            let usedFallback = false
            const args = buildReplaceArgs({
                videoName,
                audioName,
                outputName: OUTPUT_NAME,
                mix,
                bgmVolume,
            })

            try {
                await ff.exec(args)
            } catch (mixErr) {
                if (!mix) throw mixErr
                console.warn("Mix failed (video likely has no audio); replacing instead:", mixErr)
                usedFallback = true
                const replaceArgs = buildReplaceArgs({
                    videoName,
                    audioName,
                    outputName: OUTPUT_NAME,
                    mix: false,
                })
                await ff.exec(replaceArgs)
            }

            const data = (await ff.readFile(OUTPUT_NAME)) as Uint8Array
            const blob = new Blob([data as BlobPart], { type: OUTPUT_MIME })

            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
            const url = URL.createObjectURL(blob)
            resultUrlRef.current = url

            const baseName = videoFile.name.replace(/\.[^.]+$/, "") || "video"
            setResultUrl(url)
            setResultName(`${baseName}-audio.mp4`)
            toast.success(usedFallback ? t("mixFallback") : t("success"))
        } catch (err) {
            console.error("Replace audio error:", err)
            toast.error(t("error"))
        } finally {
            // Best-effort cleanup of the virtual FS.
            try {
                await ff.deleteFile(videoName)
                await ff.deleteFile(audioName)
                await ff.deleteFile(OUTPUT_NAME)
            } catch {
                // ignore
            }
            setProcessing(false)
        }
    }

    const canRun = Boolean(videoFile && audioFile && loaded && !processing)

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: video preview + result */}
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                    {(loading || !loaded) && (
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
                                onChange={handleVideoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center space-y-6 relative z-0">
                                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{t("videoUploadTitle")}</p>
                                    <p className="text-sm text-muted-foreground mt-2">{t("videoUploadHint")}</p>
                                </div>
                                <Button variant="secondary" className="mt-4 pointer-events-none">
                                    {t("chooseVideo")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden group">
                            <video src={videoUrl!} className="w-full h-full object-contain" controls />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={clearVideo}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </GlassCard>

                {resultUrl && (
                    <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileVideo className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground truncate">{resultName}</p>
                            </div>
                        </div>
                        <video src={resultUrl} controls className="w-full rounded-lg bg-black" />
                        <Button asChild size="lg" className="rounded-xl shadow-lg w-full">
                            <a href={resultUrl} download={resultName}>
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            {/* Right: audio input + options */}
            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 relative space-y-6">
                        {!videoFile && (
                            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Video className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-muted-foreground">{t("selectPrompt")}</p>
                                </div>
                            </div>
                        )}

                        {/* Audio file picker */}
                        <div className="space-y-4">
                            <Label className="text-base flex items-center gap-2">
                                <AudioLines className="w-4 h-4" />
                                {t("audioLabel")}
                            </Label>
                            <div
                                className={cn(
                                    "relative rounded-xl border-2 border-dashed p-5 transition-all",
                                    audioFile
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                                )}
                            >
                                <Input
                                    type="file"
                                    accept="audio/*,.mp3,.wav,.aac,.m4a"
                                    onChange={handleAudioChange}
                                    disabled={!videoFile}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex items-center gap-3 relative z-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Music className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">
                                            {audioFile ? audioFile.name : t("audioPlaceholder")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{t("audioHint")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mix toggle */}
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-secondary/20 p-4">
                            <div className="space-y-1">
                                <Label htmlFor="mix-toggle" className="text-base">
                                    {t("mixLabel")}
                                </Label>
                                <p className="text-xs text-muted-foreground">{t("mixHint")}</p>
                            </div>
                            <Switch
                                id="mix-toggle"
                                checked={mix}
                                onCheckedChange={setMix}
                                disabled={!videoFile}
                            />
                        </div>

                        {/* BGM volume (mix only) */}
                        {mix && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex justify-between">
                                    <Label className="text-base">{t("bgmVolumeLabel")}</Label>
                                    <span className="font-mono font-bold text-primary">
                                        {Math.round(bgmVolume * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[bgmVolume]}
                                    onValueChange={([v]) => setBgmVolume(v)}
                                    min={0}
                                    max={2}
                                    step={0.05}
                                    disabled={!videoFile}
                                    className="py-4"
                                />
                                <p className="text-xs text-muted-foreground">{t("bgmVolumeHint")}</p>
                            </div>
                        )}

                        <div className="mt-auto pt-4">
                            <Button
                                className="w-full h-14 text-lg rounded-xl shadow-lg"
                                onClick={replace}
                                disabled={!canRun}
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <AudioLines className="mr-2" />
                                )}
                                {mix ? t("mixAction") : t("replaceAction")}
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
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
