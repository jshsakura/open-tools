"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Upload,
  Download,
  Loader2,
  X,
  Minimize2,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useFfmpeg } from "@/hooks/use-ffmpeg"
import {
  buildCompressArgs,
  percentSaved,
  formatBytes,
  type Quality,
  type MaxHeight,
} from "./video-compressor.utils"

interface Result {
  url: string
  name: string
  originalSize: number
  compressedSize: number
}

export function VideoCompressor() {
  const t = useTranslations("VideoCompressor")
  const { load, run, loaded, loading, progress } = useFfmpeg()

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const [quality, setQuality] = useState<Quality>("medium")
  const [maxHeight, setMaxHeight] = useState<MaxHeight>("keep")

  const previewUrlRef = useRef<string | null>(null)
  const resultUrlRef = useRef<string | null>(null)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    previewUrlRef.current = previewUrl
  }, [previewUrl])

  useEffect(() => {
    resultUrlRef.current = result?.url ?? null
  }, [result])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result?.url) URL.revokeObjectURL(result.url)
    setVideoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
  }

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (result?.url) URL.revokeObjectURL(result.url)
    setVideoFile(null)
    setPreviewUrl(null)
    setResult(null)
  }

  const compress = async () => {
    if (!videoFile || !loaded || processing) return
    setProcessing(true)
    setResult(null)

    try {
      const ext = videoFile.name.split(".").pop() || "mp4"
      const inputName = `input.${ext}`
      const outputName = "compressed.mp4"
      const args = buildCompressArgs({ inputName, outputName, quality, maxHeight })

      const blob = await run(inputName, videoFile, args, outputName, "video/mp4")

      if (result?.url) URL.revokeObjectURL(result.url)
      const url = URL.createObjectURL(blob)
      const baseName = videoFile.name.replace(/\.[^.]+$/, "")
      setResult({
        url,
        name: `${baseName}-compressed.mp4`,
        originalSize: videoFile.size,
        compressedSize: blob.size,
      })
      toast.success(t("success"))
    } catch (error) {
      console.error("Compression error:", error)
      toast.error(t("error"))
    } finally {
      setProcessing(false)
    }
  }

  const saved = result ? percentSaved(result.originalSize, result.compressedSize) : 0

  return (
    <div className="mx-auto max-w-5xl flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left: Preview / Upload */}
      <div className="w-full lg:w-1/2 space-y-6">
        <GlassCard className="p-1 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
          {!loaded && (
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
                disabled={!loaded || loading}
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
                src={previewUrl!}
                className="w-full h-full object-contain"
                controls
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={clearFile}
                disabled={processing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Result */}
        {result && (
          <GlassCard className="p-6 rounded-xl border-primary/20 animate-in slide-in-from-left duration-300 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary/40 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("original")}
                </p>
                <p className="text-xl font-bold font-mono mt-1">
                  {formatBytes(result.originalSize)}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t("compressed")}
                </p>
                <p className="text-xl font-bold font-mono mt-1 text-primary">
                  {formatBytes(result.compressedSize)}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-semibold",
                saved > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
            >
              <ArrowDown className="w-4 h-4" />
              {t("sizeSaved", { percent: saved })}
            </div>

            <Button
              asChild
              size="lg"
              className="w-full rounded-xl shadow-lg hover:shadow-primary/20 transition-all"
            >
              <a href={result.url} download={result.name}>
                <Download className="mr-2 h-5 w-5" />
                {t("download")}
              </a>
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Right: Options */}
      <div className="w-full lg:w-1/2">
        <GlassCard className="h-full rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 flex-1 relative space-y-8">
            {!videoFile && (
              <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                <div className="text-center p-6 rounded-xl bg-background/80 shadow-2xl border border-border/20 max-w-xs mx-auto">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Minimize2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {t("selectPrompt")}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base">{t("qualityLabel")}</Label>
              <Select
                value={quality}
                onValueChange={(v) => setQuality(v as Quality)}
                disabled={!videoFile}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t("quality.high")}</SelectItem>
                  <SelectItem value="medium">{t("quality.medium")}</SelectItem>
                  <SelectItem value="low">{t("quality.low")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("qualityHint")}</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base">{t("resolutionLabel")}</Label>
              <Select
                value={maxHeight}
                onValueChange={(v) => setMaxHeight(v as MaxHeight)}
                disabled={!videoFile}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">{t("resolution.keep")}</SelectItem>
                  <SelectItem value="1080">{t("resolution.1080")}</SelectItem>
                  <SelectItem value="720">{t("resolution.720")}</SelectItem>
                  <SelectItem value="480">{t("resolution.480")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("resolutionHint")}
              </p>
            </div>

            <div className="mt-auto pt-4">
              <Button
                className="w-full h-14 text-lg rounded-xl shadow-lg"
                onClick={compress}
                disabled={!videoFile || !loaded || processing}
              >
                {processing ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Minimize2 className="mr-2" />
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
