"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useTranslations } from "next-intl"
import QRCode from "qrcode"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Copy, Wifi, Settings2, Share2, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { buildWifiPayload, type WifiEncryption } from "./wifi-qr-generator.utils"

const QR_SIZE = 1024
const QR_MARGIN = 2

export function WifiQrGenerator() {
    const t = useTranslations("WifiQrGenerator")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [ssid, setSsid] = useState("")
    const [password, setPassword] = useState("")
    const [encryption, setEncryption] = useState<WifiEncryption>("WPA")
    const [hidden, setHidden] = useState(false)

    const isOpen = encryption === "nopass"

    const payload = useMemo(
        () => buildWifiPayload({ ssid, password, encryption, hidden }),
        [ssid, password, encryption, hidden],
    )

    useEffect(() => {
        if (!canvasRef.current) return

        QRCode.toCanvas(
            canvasRef.current,
            payload,
            {
                width: QR_SIZE,
                margin: QR_MARGIN,
                errorCorrectionLevel: "M",
            },
            (error) => {
                if (error) {
                    console.error("WiFi QR generation error:", error)
                    toast.error(t("errorGenerate"))
                }
            },
        )
    }, [payload, t])

    const downloadPNG = () => {
        if (!canvasRef.current) return
        if (!ssid.trim()) {
            toast.error(t("errorNoSsid"))
            return
        }

        canvasRef.current.toBlob((blob) => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `wifi-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success(t("downloadedPng"))
        })
    }

    const copyPayload = async () => {
        try {
            await navigator.clipboard.writeText(payload)
            toast.success(t("copiedPayload"))
        } catch (error) {
            console.error("Copy error:", error)
            toast.error(t("errorCopy"))
        }
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
                                <p className="text-sm text-muted-foreground">{t("qrCodeReady")}</p>
                            </div>

                            <div className="flex items-center justify-center p-8 bg-secondary/30 rounded-2xl border border-dashed border-border overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    className="max-w-full h-auto rounded-md shadow-sm bg-white"
                                    style={{ maxWidth: "300px", maxHeight: "300px" }}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button onClick={downloadPNG} className="w-full h-11 shadow-lg shadow-primary/20" size="lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("downloadPng")}
                                </Button>
                                <Button onClick={copyPayload} variant="secondary" className="w-full h-11">
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t("copyPayload")}
                                </Button>
                            </div>

                            <div className="rounded-xl bg-secondary/30 border border-border/30 p-3">
                                <p className="text-xs text-muted-foreground mb-1">{t("payloadLabel")}</p>
                                <p className="font-mono text-xs break-all">{payload}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="hidden md:block text-center text-sm text-muted-foreground/60">
                        <p>{t("scanHint")}</p>
                    </div>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full md:w-1/2 lg:w-7/12 order-2 space-y-6">
                <GlassCard className="shadow-sm">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-blue-500" />
                            {t("networkLabel")}
                        </h2>

                        <div className="space-y-2">
                            <Label>{t("ssidLabel")}</Label>
                            <Input
                                value={ssid}
                                onChange={(e) => setSsid(e.target.value)}
                                placeholder={t("ssidPlaceholder")}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("encryptionLabel")}</Label>
                            <Select value={encryption} onValueChange={(value) => setEncryption(value as WifiEncryption)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WPA">{t("encWpa")}</SelectItem>
                                    <SelectItem value="WEP">{t("encWep")}</SelectItem>
                                    <SelectItem value="nopass">{t("encNone")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isOpen && (
                            <div className="space-y-2">
                                <Label>{t("passwordLabel")}</Label>
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("passwordPlaceholder")}
                                    className="h-11"
                                />
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="shadow-sm">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-indigo-500" />
                            {t("optionsLabel")}
                        </h2>

                        <div className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/30 p-4">
                            <div className="flex items-start gap-3">
                                <EyeOff className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <Label className="cursor-pointer">{t("hiddenLabel")}</Label>
                                    <p className="text-xs text-muted-foreground mt-1">{t("hiddenDesc")}</p>
                                </div>
                            </div>
                            <Switch checked={hidden} onCheckedChange={setHidden} />
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
