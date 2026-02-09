"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Info,
    Monitor,
    Laptop,
    Smartphone,
    Chrome,
    Globe,
    Maximize,
    Copy,
    CheckCircle2,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BrowserInfo {
    userAgent: string
    browser: string
    version: string
    os: string
    language: string
    screenSize: string
    viewport: string
    cookiesEnabled: boolean
    doNotTrack: string
    online: boolean
    pdfSupport: boolean
    gpuAcceleration: boolean
    hardwareConcurrency: number
    deviceMemory: number | null
}

export function BrowserInfoTool() {
    const t = useTranslations('BrowserInfo')
    const [info, setInfo] = useState<BrowserInfo | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const ua = navigator.userAgent
        let browserName = "Unknown"

        if (ua.indexOf("Firefox") > -1) browserName = "Mozilla Firefox"
        else if (ua.indexOf("SamsungBrowser") > -1) browserName = "Samsung Internet"
        else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browserName = "Opera"
        else if (ua.indexOf("Trident") > -1) browserName = "Internet Explorer"
        else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browserName = "Microsoft Edge"
        else if (ua.indexOf("Chrome") > -1) browserName = "Google Chrome"
        else if (ua.indexOf("Safari") > -1) browserName = "Apple Safari"

        const platform = navigator.platform
        let os = "Unknown OS"
        if (platform.indexOf("Win") !== -1) os = "Windows"
        if (platform.indexOf("Mac") !== -1) os = "macOS"
        if (platform.indexOf("Linux") !== -1) os = "Linux"
        if (/Android/.test(ua)) os = "Android"
        if (/iPhone|iPad|iPod/.test(ua)) os = "iOS"

        const canvas = document.createElement("canvas")
        const webgl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        const deviceMemory = "deviceMemory" in navigator ? (navigator as any).deviceMemory : null

        setInfo({
            userAgent: ua,
            browser: browserName,
            version: navigator.appVersion,
            os: os,
            language: navigator.language,
            screenSize: `${window.screen.width} x ${window.screen.height}`,
            viewport: `${window.innerWidth} x ${window.innerHeight}`,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || "Unspecified",
            online: navigator.onLine,
            pdfSupport: 'pdfViewerEnabled' in navigator ? (navigator as any).pdfViewerEnabled : false,
            gpuAcceleration: Boolean(webgl),
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: typeof deviceMemory === "number" ? deviceMemory : null
        })
    }, [])

    const copyUA = () => {
        if (!info) return
        navigator.clipboard.writeText(info.userAgent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!info) return null
    const dntActive = info.doNotTrack === "1"

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Hero Card */}
                <Card className="md:col-span-2 overflow-hidden border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/10 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
                                    <Chrome className="h-7 w-7 text-primary" />
                                    {t('browserDetection')}
                                </CardTitle>
                                <CardDescription className="text-base">{t('environmentReport')}</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 gap-2 px-4 py-2 text-sm">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                {t('liveSession')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 p-8 rounded-3xl bg-secondary/30 border border-border/10">
                            <div className="p-7 rounded-3xl bg-primary/10 text-primary">
                                {info.os === "macOS" || info.os === "Windows" ? <Laptop className="h-16 w-16" /> : <Smartphone className="h-16 w-16" />}
                            </div>
                            <div className="text-center md:text-left space-y-3">
                                <h2 className="text-4xl font-black tracking-tighter">{info.browser}</h2>
                                <p className="text-muted-foreground text-lg font-medium">{t('runningOn', { os: info.os })}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-2">
                                    <Badge variant="secondary" className="rounded-lg font-bold text-xs uppercase tracking-wider px-3 py-1.5">{info.language}</Badge>
                                    <Badge variant="secondary" className="rounded-lg font-bold text-xs uppercase tracking-wider px-3 py-1.5">Online: {String(info.online)}</Badge>
                                    <Badge variant="secondary" className="rounded-lg font-bold text-xs uppercase tracking-wider px-3 py-1.5">PDF: {info.pdfSupport ? t('enabled') : t('disabled')}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-5 p-6 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-4 rounded-xl bg-primary/10 text-primary">
                                    <Monitor className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('displayAnalysis')}</p>
                                    <p className="font-black text-2xl tracking-tight tabular-nums">{info.screenSize}</p>
                                    <p className="text-sm text-muted-foreground">{t('screenResolution')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 p-6 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Maximize className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('windowViewport')}</p>
                                    <p className="font-black text-2xl tracking-tight tabular-nums">{info.viewport}</p>
                                    <p className="text-sm text-muted-foreground">{t('internalBrowserSize')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 p-6 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('gpuAcceleration')}</p>
                                    <p className="font-black text-2xl tracking-tight tabular-nums">
                                        {info.gpuAcceleration ? t('enabled') : t('disabled')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('gpuAccelerationDesc')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 p-6 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-4 rounded-xl bg-orange-500/10 text-orange-500">
                                    <Info className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('hardwareThreads')}</p>
                                    <p className="font-black text-2xl tracking-tight tabular-nums">
                                        {info.hardwareConcurrency ? info.hardwareConcurrency : t('unknown')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('hardwareThreadsDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-lg overflow-hidden">
                        <CardHeader className="border-b border-border/10 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10">
                            <CardTitle className="flex items-center gap-2 text-base font-black">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                {t('privacySettings')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-border/10">
                                <span className="text-sm font-medium text-muted-foreground">{t('cookies')}</span>
                                <Badge
                                    variant={info.cookiesEnabled ? "default" : "destructive"}
                                    className="text-xs font-bold rounded-full px-3 py-1 uppercase tracking-tight"
                                >
                                    {info.cookiesEnabled ? t('enabled') : t('disabled')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border/10">
                                <span className="text-sm font-medium text-muted-foreground">{t('doNotTrack')}</span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-xs font-bold rounded-full px-3 py-1 uppercase tracking-tight",
                                        dntActive
                                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                            : "bg-muted text-foreground/70"
                                    )}
                                >
                                    {dntActive ? t('active') : t('notSent')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border/10">
                                <span className="text-sm font-medium text-muted-foreground">{t('javascript')}</span>
                                <Badge
                                    variant="default"
                                    className="text-xs font-bold rounded-full px-3 py-1 uppercase tracking-tight bg-green-500 hover:bg-green-600"
                                >
                                    {t('active')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm font-medium text-muted-foreground">{t('pdfSupport')}</span>
                                <Badge
                                    variant={info.pdfSupport ? "default" : "secondary"}
                                    className={cn(
                                        "text-xs font-bold rounded-full px-3 py-1 uppercase tracking-tight",
                                        info.pdfSupport ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                                    )}
                                >
                                    {info.pdfSupport ? t('enabled') : t('disabled')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2 border-t border-border/10">
                                {t('note')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/30 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-black">
                                <Info className="h-5 w-5 text-primary" />
                                {t('environmentReport')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/30 px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OS</span>
                                <span className="font-bold">{info.os}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/30 px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</span>
                                <span className="font-bold">{info.language}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/30 px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Memory</span>
                                <span className="font-bold tabular-nums">
                                    {info.deviceMemory ? `${info.deviceMemory} GB` : t('unknown')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Agent String Card */}
                <Card className="md:col-span-3 border-primary/20 bg-card/40 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/10">
                        <div className="flex items-center gap-2.5">
                            <Globe className="h-5 w-5 text-primary" />
                            <h4 className="text-base font-black tracking-tight">{t('fullUserAgentString')}</h4>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyUA}
                            className="h-9 gap-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-all text-sm font-bold px-4"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? t('copied') : t('copyString')}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 bg-secondary/20">
                        <code className="text-sm font-mono break-all leading-relaxed text-muted-foreground/80 block select-all">
                            {info.userAgent}
                        </code>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
