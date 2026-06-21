"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { fetchFile } from "@ffmpeg/util"
import {
    Upload,
    Combine,
    Download,
    Loader2,
    X,
    ArrowUp,
    ArrowDown,
    FileVideo,
    Film,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import { buildConcatArgs } from "./video-merger.utils"

// Common normalization target for all clips. 720p keeps WASM encoding fast
// while staying broadly compatible.
const OUTPUT_RESOLUTION = { width: 1280, height: 720 } as const

interface ClipItem {
    id: string
    file: File
    url: string
}

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function safeExt(name: string): string {
    const ext = name.split(".").pop()
    return ext && ext.length <= 5 ? ext.toLowerCase() : "mp4"
}

export function VideoMerger() {
    const t = useTranslations("VideoMerger")
    const { ffmpeg, load, loaded, loading, progress } = useFfmpeg()

    const [clips, setClips] = useState<ClipItem[]>([])
    const [processing, setProcessing] = useState(false)
    const [resultUrl, setResultUrl] = useState<string | null>(null)

    // Load ffmpeg on mount.
    useEffect(() => {
        load().then((ok) => {
            if (!ok) toast.error(t("loadError"))
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Revoke object URLs on unmount to avoid leaks.
    useEffect(() => {
        return () => {
            clips.forEach((c) => URL.revokeObjectURL(c.url))
            if (resultUrl) URL.revokeObjectURL(resultUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const added: ClipItem[] = Array.from(files).map((file) => ({
            id: makeId(),
            file,
            url: URL.createObjectURL(file),
        }))
        // Immutable: append new clips.
        setClips((prev) => [...prev, ...added])
        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }
        // Allow re-selecting the same files later.
        e.target.value = ""
    }

    const removeClip = (id: string) => {
        setClips((prev) => {
            const target = prev.find((c) => c.id === id)
            if (target) URL.revokeObjectURL(target.url)
            return prev.filter((c) => c.id !== id)
        })
    }

    const moveClip = (index: number, direction: -1 | 1) => {
        setClips((prev) => {
            const next = index + direction
            if (next < 0 || next >= prev.length) return prev
            // Immutable swap.
            const copy = [...prev]
            const tmp = copy[index]
            copy[index] = copy[next]
            copy[next] = tmp
            return copy
        })
    }

    const clearAll = () => {
        clips.forEach((c) => URL.revokeObjectURL(c.url))
        setClips([])
        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }
    }

    const mergeVideos = async () => {
        if (clips.length < 2 || !loaded) return
        const ff = ffmpeg.current
        if (!ff) {
            toast.error(t("loadError"))
            return
        }

        setProcessing(true)
        if (resultUrl) {
            URL.revokeObjectURL(resultUrl)
            setResultUrl(null)
        }

        const inputNames = clips.map((clip, i) => `input${i}.${safeExt(clip.file.name)}`)
        const outputName = "merged.mp4"

        try {
            // Write every input to the virtual FS (multiple inputs => direct ref).
            for (let i = 0; i < clips.length; i++) {
                await ff.writeFile(inputNames[i], await fetchFile(clips[i].file))
            }

            const args = buildConcatArgs(inputNames, outputName, OUTPUT_RESOLUTION)
            await ff.exec(args)

            const data = (await ff.readFile(outputName)) as Uint8Array
            const url = URL.createObjectURL(
                new Blob([data as BlobPart], { type: "video/mp4" }),
            )
            setResultUrl(url)
            toast.success(t("successToast"))
        } catch (error) {
            console.error("Video merge error:", error)
            toast.error(t("errorToast"))
        } finally {
            // Best-effort cleanup of the virtual FS.
            for (const name of [...inputNames, outputName]) {
                try {
                    await ff.deleteFile(name)
                } catch {
                    // ignore
                }
            }
            setProcessing(false)
        }
    }

    const canMerge = clips.length >= 2 && loaded && !processing

    return (
        <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Upload */}
            <GlassCard className="p-1 rounded-2xl relative overflow-hidden">
                {(loading || !loaded) && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-2xl">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-sm font-medium">{t("ffmpegLoading")}</p>
                    </div>
                )}

                <div className="relative flex flex-col items-center justify-center p-10 m-1 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group">
                    <Input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleFilesChange}
                        disabled={!loaded || processing}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className="text-center space-y-4 relative z-0">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{t("inputPlaceholder")}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t("addHint")}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Ordered clip list */}
            {clips.length > 0 && (
                <GlassCard className="p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">
                            {t("listTitle", { count: clips.length })}
                        </Label>
                        <Button variant="ghost" size="sm" onClick={clearAll} disabled={processing}>
                            {t("clearAll")}
                        </Button>
                    </div>

                    <ul className="space-y-2">
                        {clips.map((clip, index) => (
                            <li
                                key={clip.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/30"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                    {index + 1}
                                </span>
                                <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center shrink-0">
                                    <Film className="w-5 h-5 text-primary/80" />
                                </div>
                                <span className="flex-1 truncate text-sm font-medium" title={clip.file.name}>
                                    {clip.file.name}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => moveClip(index, -1)}
                                        disabled={index === 0 || processing}
                                        aria-label={t("moveUp")}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => moveClip(index, 1)}
                                        disabled={index === clips.length - 1 || processing}
                                        aria-label={t("moveDown")}
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => removeClip(clip.id)}
                                        disabled={processing}
                                        aria-label={t("remove")}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {clips.length < 2 && (
                        <p className="text-xs text-muted-foreground text-center">{t("needTwo")}</p>
                    )}

                    <Button
                        className="w-full h-14 text-lg rounded-xl shadow-lg"
                        onClick={mergeVideos}
                        disabled={!canMerge}
                    >
                        {processing ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            <Combine className="mr-2" />
                        )}
                        {processing ? t("processing") : t("mergeAction")}
                    </Button>

                    {processing && (
                        <div className="space-y-2">
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
                </GlassCard>
            )}

            {/* Result */}
            {resultUrl && (
                <GlassCard className="p-6 rounded-2xl border-primary/20 space-y-4 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <FileVideo className="w-5 h-5" />
                        {t("resultTitle")}
                    </div>
                    <video
                        src={resultUrl}
                        controls
                        className="w-full rounded-xl bg-black aspect-video object-contain"
                    />
                    <Button asChild size="lg" className="w-full rounded-xl shadow-lg">
                        <a href={resultUrl} download="merged.mp4">
                            <Download className="mr-2 h-5 w-5" />
                            {t("download")}
                        </a>
                    </Button>
                </GlassCard>
            )}
        </div>
    )
}
