"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Upload, Music, Download, Loader2, X, Repeat, FileAudio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { AudioOutputPicker } from "./audio-output-picker"
import { FORMATS, type AudioFormat } from "./audio-shared.utils"
import { buildLoopArgs, MIN_LOOPS, MAX_LOOPS } from "./audio-loop.utils"

export function AudioLoop() {
    const t = useTranslations("AudioLoop")
    const { load, run, loaded, loading, progress } = useFfmpeg()

    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [resultName, setResultName] = useState("")
    const [processing, setProcessing] = useState(false)

    const [count, setCount] = useState(2)
    const [format, setFormat] = useState<AudioFormat>("mp3")
    const [bitrate, setBitrate] = useState(192)

    const previewRef = useRef<string | null>(null)
    const resultRef = useRef<string | null>(null)

    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
    }, [load, t])

    useEffect(() => {
        return () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current)
            if (resultRef.current) URL.revokeObjectURL(resultRef.current)
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (previewRef.current) URL.revokeObjectURL(previewRef.current)
        if (resultRef.current) URL.revokeObjectURL(resultRef.current)
        const url = URL.createObjectURL(f)
        previewRef.current = url
        resultRef.current = null
        setFile(f)
        setPreviewUrl(url)
        setResultUrl(null)
        setResultName("")
    }

    const clearFile = () => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current)
        if (resultRef.current) URL.revokeObjectURL(resultRef.current)
        previewRef.current = null
        resultRef.current = null
        setFile(null)
        setPreviewUrl(null)
        setResultUrl(null)
        setResultName("")
    }

    const process = async () => {
        if (!file || !loaded || processing) return
        setProcessing(true)
        try {
            const spec = FORMATS[format]
            const ext = file.name.split(".").pop() || "mp3"
            const inputName = `input.${ext}`
            const outputName = `looped.${spec.ext}`
            const args = buildLoopArgs({ inputName, outputName, count, format, bitrate })
            const blob = await run(inputName, file, args, outputName, spec.mime)

            if (resultRef.current) URL.revokeObjectURL(resultRef.current)
            const url = URL.createObjectURL(blob)
            resultRef.current = url
            const baseName = file.name.replace(/\.[^.]+$/, "") || "audio"
            setResultUrl(url)
            setResultName(`${baseName}-x${count}.${spec.ext}`)
            toast.success(t("success"))
        } catch (err) {
            console.error("Audio loop error:", err)
            toast.error(t("error"))
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full lg:w-1/2 space-y-6">
                <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[360px] flex flex-col">
                    {(loading || !loaded) && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">{t("loading")}</p>
                        </div>
                    )}

                    {!file ? (
                        <div className="relative flex-1 flex flex-col items-center justify-center p-12 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                            <Input
                                type="file"
                                accept="audio/*"
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
                                    {t("chooseFile")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex-1 flex items-center justify-center bg-secondary/30 rounded-xl overflow-hidden group p-8">
                            <div className="w-full space-y-4 text-center">
                                <FileAudio className="w-16 h-16 mx-auto text-primary" />
                                <p className="text-sm font-medium truncate px-4">{file.name}</p>
                                <audio src={previewUrl!} controls className="w-full" />
                            </div>
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
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                <FileAudio className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold">{t("resultTitle")}</h3>
                                <p className="text-sm text-muted-foreground truncate">{resultName}</p>
                            </div>
                        </div>
                        <audio src={resultUrl} controls className="w-full" />
                        <Button asChild size="lg" className="rounded-xl shadow-lg w-full">
                            <a href={resultUrl} download={resultName}>
                                <Download className="mr-2 h-5 w-5" />
                                {t("download")}
                            </a>
                        </Button>
                    </GlassCard>
                )}
            </div>

            <div className="w-full lg:w-1/2">
                <GlassCard className="h-full rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 relative space-y-6">
                        {!file && (
                            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Music className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="font-medium text-muted-foreground">{t("selectPrompt")}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base flex items-center gap-2">
                                    <Repeat className="w-4 h-4" />
                                    {t("countLabel")}
                                </Label>
                                <span className="font-mono font-bold text-primary text-lg">{count}×</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground/50 select-none font-mono">
                                <span>{MIN_LOOPS}×</span>
                                <span>{MAX_LOOPS}×</span>
                            </div>
                            <Slider
                                value={[count]}
                                min={MIN_LOOPS}
                                max={MAX_LOOPS}
                                step={1}
                                onValueChange={([v]) => setCount(Math.round(v))}
                                className="py-2"
                            />
                            <p className="text-xs text-muted-foreground">{t("countHint")}</p>
                        </div>

                        <AudioOutputPicker
                            format={format}
                            onFormatChange={setFormat}
                            bitrate={bitrate}
                            onBitrateChange={setBitrate}
                            disabled={!file}
                            formatLabel={t("formatLabel")}
                            bitrateLabel={t("bitrateLabel")}
                            losslessNote={t("losslessNote")}
                        />

                        <div className="mt-auto pt-4">
                            <Button
                                className="w-full h-14 text-lg rounded-xl shadow-lg"
                                onClick={process}
                                disabled={!file || !loaded || processing}
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <Repeat className="mr-2" />
                                )}
                                {t("action")}
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
