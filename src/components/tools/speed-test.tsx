"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Zap,
    ArrowDown,
    ArrowUp,
    Activity,
    RefreshCcw,
    Play,
    Gauge
} from "lucide-react"
import { cn } from "@/lib/utils"

export function SpeedTestTool() {
    const t = useTranslations('SpeedTest')
    const [running, setRunning] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<"idle" | "ping" | "download" | "upload" | "complete">("idle")

    const [results, setResults] = useState({
        ping: 0,
        download: 0,
        upload: 0
    })

    const abortControllerRef = useRef<AbortController | null>(null)

    const measurePing = async () => {
        setStatus("ping")
        const start = performance.now()
        try {
            await fetch("https://www.google.com/favicon.ico", { mode: 'no-cors', cache: 'no-store' })
            const end = performance.now()
            return Math.round(end - start)
        } catch (e) {
            return 0
        }
    }

    const measureDownload = async () => {
        setStatus("download")
        const downloadUrl = "https://speed.cloudflare.com/__down?bytes=15000000" // ~15MB
        const start = performance.now()

        try {
            const response = await fetch(downloadUrl, { cache: 'no-store', signal: abortControllerRef.current?.signal })
            const reader = response.body?.getReader()
            let receivedLength = 0

            if (!reader) return 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                receivedLength += value.length
                const currentProgress = Math.min(90, (receivedLength / 15000000) * 100)
                setProgress(currentProgress)
            }

            const end = performance.now()
            const duration = (end - start) / 1000 // seconds
            const bitsLoaded = receivedLength * 8
            const speedBps = bitsLoaded / duration
            return Math.round(speedBps / 1000000) // Mbps
        } catch (e) {
            console.error("Download error:", e)
            return 0
        }
    }

    const measureUpload = async () => {
        setStatus("upload")
        const uploadUrl = "https://speed.cloudflare.com/__up"
        const data = new Uint8Array(5000000) // 5MB garbage data
        const start = performance.now()

        try {
            await fetch(uploadUrl, {
                method: 'POST',
                body: data,
                cache: 'no-store',
                signal: abortControllerRef.current?.signal
            })
            const end = performance.now()
            const duration = (end - start) / 1000 // seconds
            const speedBps = (data.length * 8) / duration
            return Math.round(speedBps / 1000000) // Mbps
        } catch (e) {
            console.error("Upload error:", e)
            return 0
        }
    }

    const startTest = async () => {
        setRunning(true)
        setProgress(0)
        setResults({ ping: 0, download: 0, upload: 0 })
        abortControllerRef.current = new AbortController()

        const ping = await measurePing()
        setResults(prev => ({ ...prev, ping }))
        setProgress(10)

        const download = await measureDownload()
        setResults(prev => ({ ...prev, download }))
        setProgress(60)

        const upload = await measureUpload()
        setResults(prev => ({ ...prev, upload }))

        setProgress(100)
        setStatus("complete")
        setRunning(false)
    }

    const stopTest = () => {
        abortControllerRef.current?.abort()
        setRunning(false)
        setStatus("idle")
        setProgress(0)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Results Overview */}
                <Card className="md:col-span-3 overflow-hidden border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/10 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                    <Zap className="h-6 w-6 text-primary" />
                                    {t('performanceReport')}
                                </CardTitle>
                                <CardDescription>{t('description')}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {running ? (
                                    <Button variant="destructive" size="sm" onClick={stopTest} className="rounded-full">{t('stop')}</Button>
                                ) : (
                                    <Button variant="default" size="sm" onClick={startTest} className="rounded-full gap-2 px-6">
                                        <Play className="h-4 w-4 fill-current" />
                                        {t('startTest')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-10 px-6 sm:px-12 pb-12">
                        {status === "idle" ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                                <div className="p-8 rounded-full bg-primary/5 border border-primary/10 animate-pulse">
                                    <Gauge className="h-20 w-20 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black tracking-tight">{t('readyToTest')}</h3>
                                    <p className="text-muted-foreground">{t('readyDesc')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    {/* Download */}
                                    <div className="p-8 rounded-3xl bg-secondary/30 border border-border/10 text-center space-y-2 relative overflow-hidden group">
                                        <div className={cn("absolute inset-0 bg-primary/5 transition-opacity duration-500", status === "download" ? "opacity-100" : "opacity-0")} />
                                        <ArrowDown className={cn("h-8 w-8 mx-auto mb-2 transition-all", status === "download" ? "text-primary animate-bounce" : "text-muted-foreground/30")} />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest relative z-10">{t('download')}</p>
                                        <div className="flex items-baseline justify-center gap-1 relative z-10">
                                            <span className="text-5xl font-black tabular-nums tracking-tighter">{results.download || (status === "download" ? "..." : "0")}</span>
                                            <span className="text-lg font-bold text-muted-foreground">{t('mbps')}</span>
                                        </div>
                                    </div>
                                    {/* Upload */}
                                    <div className="p-8 rounded-3xl bg-secondary/30 border border-border/10 text-center space-y-2 relative overflow-hidden">
                                        <div className={cn("absolute inset-0 bg-orange-500/5 transition-opacity duration-500", status === "upload" ? "opacity-100" : "opacity-0")} />
                                        <ArrowUp className={cn("h-8 w-8 mx-auto mb-2 transition-all", status === "upload" ? "text-orange-500 animate-bounce" : "text-muted-foreground/30")} />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest relative z-10">{t('upload')}</p>
                                        <div className="flex items-baseline justify-center gap-1 relative z-10">
                                            <span className="text-5xl font-black tabular-nums tracking-tighter">{results.upload || (status === "upload" ? "..." : "0")}</span>
                                            <span className="text-lg font-bold text-muted-foreground">{t('mbps')}</span>
                                        </div>
                                    </div>
                                    {/* Ping */}
                                    <div className="p-8 rounded-3xl bg-secondary/30 border border-border/10 text-center space-y-2">
                                        <Activity className={cn("h-8 w-8 mx-auto mb-2 transition-all", status === "ping" ? "text-green-500 animate-pulse" : "text-muted-foreground/30")} />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('stability')}</p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-5xl font-black tabular-nums tracking-tighter">{results.ping || (status === "ping" ? "..." : "0")}</span>
                                            <span className="text-lg font-bold text-muted-foreground">{t('ms')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                            {status === "ping" && t('measuringLatency')}
                                            {status === "download" && t('testingDownload')}
                                            {status === "upload" && t('testingUpload')}
                                            {status === "complete" && t('testComplete')}
                                        </span>
                                        <span className="text-xs font-bold text-muted-foreground">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-3 rounded-full bg-secondary" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Stats / Info */}
                <Card className="border-border/30 bg-card/40 backdrop-blur-sm p-6 space-y-4 h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <RefreshCcw className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-sm">{t('testingMethodology')}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('testingMethodologyDesc')}
                    </p>
                </Card>

                <Card className="border-border/30 bg-card/40 backdrop-blur-sm p-6 space-y-4 h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-sm">{t('whatIsJitter')}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('jitterDesc')}
                    </p>
                </Card>

                <Card className="border-border/30 bg-card/40 backdrop-blur-sm p-6 space-y-4 h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Zap className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-sm">{t('fiberVs5g')}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('fiberVs5gDesc')}
                    </p>
                </Card>
            </div>
        </div>
    )
}
