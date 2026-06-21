"use client"

import { useCallback, useRef, useState } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"

/**
 * Shared FFmpeg.wasm loader + runner for all video/audio tools.
 * Loads the single-threaded core once (lazily), tracks load/run progress,
 * and exposes a `run()` that writes the input, executes args, and returns the
 * output bytes — so every media tool shares one correct, consistent pipeline.
 */
export function useFfmpeg() {
    const ffmpegRef = useRef<FFmpeg | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const load = useCallback(async (): Promise<boolean> => {
        if (ffmpegRef.current && loaded) return true
        setLoading(true)
        try {
            if (!ffmpegRef.current) ffmpegRef.current = new FFmpeg()
            const ffmpeg = ffmpegRef.current
            ffmpeg.on("progress", ({ progress }) => {
                setProgress(Math.min(100, Math.max(0, Math.round(progress * 100))))
            })
            await ffmpeg.load({
                coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
            })
            setLoaded(true)
            return true
        } catch (err) {
            console.error("FFmpeg load error:", err)
            return false
        } finally {
            setLoading(false)
        }
    }, [loaded])

    /**
     * Write `inputFile` as `inputName`, run `args`, read `outputName`, and
     * return it as a Blob of `outputMime`. Cleans up the virtual FS afterward.
     */
    const run = useCallback(
        async (
            inputName: string,
            inputFile: File | Blob,
            args: string[],
            outputName: string,
            outputMime: string,
        ): Promise<Blob> => {
            const ffmpeg = ffmpegRef.current
            if (!ffmpeg || !loaded) throw new Error("FFmpeg not loaded")
            setProgress(0)
            await ffmpeg.writeFile(inputName, await fetchFile(inputFile))
            await ffmpeg.exec(args)
            const data = await ffmpeg.readFile(outputName)
            try {
                await ffmpeg.deleteFile(inputName)
                await ffmpeg.deleteFile(outputName)
            } catch {
                // best-effort cleanup
            }
            const bytes = data as Uint8Array
            return new Blob([bytes as BlobPart], { type: outputMime })
        },
        [loaded],
    )

    return { ffmpeg: ffmpegRef, load, run, loaded, loading, progress, setProgress }
}
