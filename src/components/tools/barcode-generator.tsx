"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Download, ScanBarcode, Settings2, Share2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { buildBarcodeSvg, encodeCode128B, type BarcodeSvgOptions } from "./barcode-generator.utils"

const PNG_SCALE = 4

interface BarcodeState {
    text: string
    barHeight: number
    moduleWidth: number
    showText: boolean
    foreground: string
    background: string
}

const INITIAL_STATE: BarcodeState = {
    text: "OPEN-TOOLS-128",
    barHeight: 100,
    moduleWidth: 2,
    showText: true,
    foreground: "#000000",
    background: "#ffffff",
}

export function BarcodeGenerator() {
    const t = useTranslations("BarcodeGenerator")
    const [state, setState] = useState<BarcodeState>(INITIAL_STATE)

    const update = <K extends keyof BarcodeState>(key: K, value: BarcodeState[K]) => {
        setState((prev) => ({ ...prev, [key]: value }))
    }

    const svgOptions: BarcodeSvgOptions = useMemo(
        () => ({
            barHeight: state.barHeight,
            moduleWidth: state.moduleWidth,
            foreground: state.foreground,
            background: state.background,
            showText: state.showText,
        }),
        [state.barHeight, state.moduleWidth, state.foreground, state.background, state.showText],
    )

    const result = useMemo(() => {
        const trimmed = state.text
        if (trimmed.length === 0) {
            return { svg: null as string | null, error: t("errorEmpty"), checksum: null as number | null }
        }

        try {
            const { checksum } = encodeCode128B(trimmed)
            const svg = buildBarcodeSvg(trimmed, svgOptions)
            return { svg, error: null as string | null, checksum }
        } catch {
            return { svg: null as string | null, error: t("errorInvalid"), checksum: null as number | null }
        }
    }, [state.text, svgOptions, t])

    const downloadSvg = () => {
        if (!result.svg) {
            toast.error(result.error ?? t("errorInvalid"))
            return
        }

        const blob = new Blob([result.svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `barcode-${Date.now()}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(t("downloadedSvg"))
    }

    const downloadPng = () => {
        if (!result.svg) {
            toast.error(result.error ?? t("errorInvalid"))
            return
        }

        const image = new Image()
        const svgBlob = new Blob([result.svg], { type: "image/svg+xml" })
        const svgUrl = URL.createObjectURL(svgBlob)

        image.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = image.width * PNG_SCALE
            canvas.height = image.height * PNG_SCALE
            const ctx = canvas.getContext("2d")

            if (!ctx) {
                URL.revokeObjectURL(svgUrl)
                toast.error(t("errorPng"))
                return
            }

            ctx.fillStyle = state.background
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(svgUrl)

            canvas.toBlob((blob) => {
                if (!blob) {
                    toast.error(t("errorPng"))
                    return
                }
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `barcode-${Date.now()}.png`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success(t("downloadedPng"))
            })
        }

        image.onerror = () => {
            URL.revokeObjectURL(svgUrl)
            toast.error(t("errorPng"))
        }

        image.src = svgUrl
    }

    return (
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left: Preview */}
            <div className="w-full md:w-1/2 lg:w-5/12 order-1">
                <div className="md:sticky md:top-24 space-y-6">
                    <GlassCard className="shadow-2xl ring-1 ring-primary/10">
                        <div className="p-6 space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-primary" />
                                    {t("resultPreview")}
                                </h2>
                                <p className="text-sm text-muted-foreground">{t("previewHint")}</p>
                            </div>

                            <div className="flex items-center justify-center p-6 bg-secondary/30 rounded-2xl border border-dashed border-border overflow-hidden min-h-[160px]">
                                {result.svg ? (
                                    <div
                                        className="w-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{ __html: result.svg }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm text-center">
                                        <AlertCircle className="w-6 h-6" />
                                        <span>{result.error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={downloadSvg}
                                    disabled={!result.svg}
                                    className="w-full h-11 shadow-lg shadow-primary/20"
                                    size="lg"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("downloadSvg")}
                                </Button>
                                <Button
                                    onClick={downloadPng}
                                    disabled={!result.svg}
                                    variant="outline"
                                    className="w-full h-11"
                                    size="lg"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("downloadPng")}
                                </Button>
                            </div>

                            {result.checksum !== null && (
                                <div className="rounded-xl bg-secondary/30 border border-border/30 p-3 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        {t("checksumLabel")}{" "}
                                        <span className="font-mono text-foreground">{result.checksum}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <div className="hidden md:block text-center text-sm text-muted-foreground/60">
                        <p>{t("symbologyHint")}</p>
                    </div>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full md:w-1/2 lg:w-7/12 order-2 space-y-6">
                <GlassCard className="shadow-sm">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ScanBarcode className="w-5 h-5 text-blue-500" />
                            {t("contentLabel")}
                        </h2>

                        <div className="space-y-2">
                            <Label>{t("textLabel")}</Label>
                            <Input
                                value={state.text}
                                onChange={(e) => update("text", e.target.value)}
                                placeholder={t("textPlaceholder")}
                                className="h-11 font-mono"
                            />
                            <p className="text-xs text-muted-foreground">{t("textHelp")}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="shadow-sm">
                    <div className="p-6 space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-indigo-500" />
                            {t("appearance")}
                        </h2>

                        {/* Colors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>{t("foregroundColor")}</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                                        <Input
                                            type="color"
                                            value={state.foreground}
                                            onChange={(e) => update("foreground", e.target.value)}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <Input
                                        value={state.foreground}
                                        onChange={(e) => update("foreground", e.target.value)}
                                        placeholder="#000000"
                                        className="font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>{t("backgroundColor")}</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 shadow-sm">
                                        <Input
                                            type="color"
                                            value={state.background}
                                            onChange={(e) => update("background", e.target.value)}
                                            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                        />
                                    </div>
                                    <Input
                                        value={state.background}
                                        onChange={(e) => update("background", e.target.value)}
                                        placeholder="#ffffff"
                                        className="font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Dimensions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>{t("barHeight")}</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{state.barHeight}px</span>
                                </div>
                                <Slider
                                    value={[state.barHeight]}
                                    onValueChange={(value) => update("barHeight", value[0])}
                                    min={40}
                                    max={240}
                                    step={10}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>{t("moduleWidth")}</Label>
                                    <span className="text-xs text-muted-foreground font-mono">{state.moduleWidth}px</span>
                                </div>
                                <Slider
                                    value={[state.moduleWidth]}
                                    onValueChange={(value) => update("moduleWidth", value[0])}
                                    min={1}
                                    max={6}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        {/* Human-readable text toggle */}
                        <div className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/30 p-4">
                            <div>
                                <Label className="cursor-pointer">{t("showTextLabel")}</Label>
                                <p className="text-xs text-muted-foreground mt-1">{t("showTextDesc")}</p>
                            </div>
                            <Switch checked={state.showText} onCheckedChange={(checked) => update("showText", checked)} />
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
