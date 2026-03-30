"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, ArrowRightLeft, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function UnixTimestamp() {
    const t = useTranslations("UnixTimestamp")
    const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000))
    const [timestampInput, setTimestampInput] = useState("")
    const [dateInput, setDateInput] = useState("")
    const [convertedDate, setConvertedDate] = useState("")
    const [convertedTimestamp, setConvertedTimestamp] = useState("")
    const [useMilliseconds, setUseMilliseconds] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    // Live current timestamp
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(
                useMilliseconds ? Date.now() : Math.floor(Date.now() / 1000)
            )
        }, 1000)
        return () => clearInterval(interval)
    }, [useMilliseconds])

    // Convert timestamp to date
    useEffect(() => {
        if (!timestampInput) {
            setConvertedDate("")
            return
        }
        const num = parseInt(timestampInput, 10)
        if (isNaN(num)) {
            setConvertedDate(t("invalid"))
            return
        }
        const ms = useMilliseconds ? num : num * 1000
        const date = new Date(ms)
        if (isNaN(date.getTime())) {
            setConvertedDate(t("invalid"))
            return
        }
        setConvertedDate(
            date.toLocaleString() + " (UTC: " + date.toISOString() + ")"
        )
    }, [timestampInput, useMilliseconds, t])

    // Convert date to timestamp
    useEffect(() => {
        if (!dateInput) {
            setConvertedTimestamp("")
            return
        }
        const date = new Date(dateInput)
        if (isNaN(date.getTime())) {
            setConvertedTimestamp(t("invalid"))
            return
        }
        const ts = useMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000)
        setConvertedTimestamp(ts.toString())
    }, [dateInput, useMilliseconds, t])

    const copyToClipboard = useCallback(
        async (text: string, field: string) => {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            toast.success(t("copied"))
            setTimeout(() => setCopiedField(null), 1500)
        },
        [t]
    )

    const useCurrentTimestamp = useCallback(() => {
        setTimestampInput(currentTimestamp.toString())
    }, [currentTimestamp])

    const useCurrentDate = useCallback(() => {
        const now = new Date()
        // Format for datetime-local input
        const pad = (n: number) => n.toString().padStart(2, "0")
        const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
        setDateInput(formatted)
    }, [])

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Current timestamp */}
            <GlassCard className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <Label className="text-muted-foreground text-xs">{t("currentTimestamp")}</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Timer className="w-5 h-5 text-amber-600" />
                            <code className="text-2xl font-mono font-bold tabular-nums">
                                {currentTimestamp}
                            </code>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useMilliseconds}
                                onChange={(e) => setUseMilliseconds(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">{t("milliseconds")}</span>
                        </label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(currentTimestamp.toString(), "current")}
                            className="gap-1"
                        >
                            {copiedField === "current" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                            {t("copy")}
                        </Button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timestamp to Date */}
                <GlassCard className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                            <Label className="font-semibold">{t("timestampToDate")}</Label>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t("enterTimestamp")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={timestampInput}
                                    onChange={(e) => setTimestampInput(e.target.value)}
                                    placeholder={t("timestampPlaceholder")}
                                    className="font-mono"
                                />
                                <Button variant="outline" size="sm" onClick={useCurrentTimestamp}>
                                    {t("now")}
                                </Button>
                            </div>
                        </div>
                        {convertedDate && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("result")}</Label>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <span className="flex-1 text-sm break-all">{convertedDate}</span>
                                    {convertedDate !== t("invalid") && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(convertedDate, "date")}
                                        >
                                            {copiedField === "date" ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Date to Timestamp */}
                <GlassCard className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                            <Label className="font-semibold">{t("dateToTimestamp")}</Label>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t("enterDate")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="datetime-local"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    step="1"
                                    className="font-mono"
                                />
                                <Button variant="outline" size="sm" onClick={useCurrentDate}>
                                    {t("now")}
                                </Button>
                            </div>
                        </div>
                        {convertedTimestamp && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{t("result")}</Label>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <code className="flex-1 text-sm font-mono break-all">
                                        {convertedTimestamp}
                                    </code>
                                    {convertedTimestamp !== t("invalid") && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(convertedTimestamp, "timestamp")}
                                        >
                                            {copiedField === "timestamp" ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
