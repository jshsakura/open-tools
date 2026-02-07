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
}

export function BrowserInfoTool() {
    const t = useTranslations()
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
            pdfSupport: 'pdfViewerEnabled' in navigator ? (navigator as any).pdfViewerEnabled : false
        })
    }, [])

    const copyUA = () => {
        if (!info) return
        navigator.clipboard.writeText(info.userAgent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!info) return null

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Hero Card */}
                <Card className="md:col-span-2 overflow-hidden border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/10 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                    <Chrome className="h-6 w-6 text-primary" />
                                    Browser Detection
                                </CardTitle>
                                <CardDescription>Comprehensive report of your current environment</CardDescription>
                            </div>
                            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 gap-1 px-3 py-1">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Live Session
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 p-6 rounded-[32px] bg-secondary/30 border border-border/10">
                            <div className="p-6 rounded-[24px] bg-primary/10 text-primary">
                                {info.os === "macOS" || info.os === "Windows" ? <Laptop className="h-12 w-12" /> : <Smartphone className="h-12 w-12" />}
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter">{info.browser}</h2>
                                <p className="text-muted-foreground font-medium">Running on <span className="text-foreground font-bold">{info.os}</span></p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                                    <Badge variant="secondary" className="rounded-md font-bold text-[10px] uppercase tracking-wider">{info.language}</Badge>
                                    <Badge variant="secondary" className="rounded-md font-bold text-[10px] uppercase tracking-wider">Online: {String(info.online)}</Badge>
                                    <Badge variant="secondary" className="rounded-md font-bold text-[10px] uppercase tracking-wider">PDF: {info.pdfSupport ? "Yes" : "No"}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <Monitor className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Display Analysis</p>
                                    <p className="font-black text-lg tracking-tight tabular-nums">{info.screenSize}</p>
                                    <p className="text-xs text-muted-foreground">Screen Resolution</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/10 hover:bg-secondary/50 transition-colors">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <Maximize className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Window Viewport</p>
                                    <p className="font-black text-lg tracking-tight tabular-nums">{info.viewport}</p>
                                    <p className="text-xs text-muted-foreground">Internal Browser Size</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy/Security Card */}
                <Card className="border-border/30 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm font-black">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            Privacy Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/10">
                                <span className="text-xs font-medium text-muted-foreground">Cookies</span>
                                <Badge variant={info.cookiesEnabled ? "default" : "destructive"} className="text-[9px] font-bold rounded-sm h-5 px-1.5 uppercase tracking-tighter">
                                    {info.cookiesEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/10">
                                <span className="text-xs font-medium text-muted-foreground">Do Not Track</span>
                                <span className="text-xs font-bold tabular-nums">{info.doNotTrack === "1" ? "Active" : "Not Sent"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/10">
                                <span className="text-xs font-medium text-muted-foreground">Javascript</span>
                                <Badge variant="default" className="text-[9px] font-bold rounded-sm h-5 px-1.5 uppercase tracking-tighter bg-green-500 hover:bg-green-600">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-medium text-muted-foreground">PDF Support</span>
                                <span className="text-xs font-bold tabular-nums">{info.pdfSupport ? "Enabled" : "Disabled"}</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mt-2">
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                Note: These values are extracted directly from your browser's navigator object and are not stored elsewhere.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* User Agent String Card */}
                <Card className="md:col-span-3 border-primary/20 bg-card/40 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/10">
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-black tracking-tight">Full User Agent String</h4>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyUA}
                            className="h-8 gap-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold"
                        >
                            {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied ? "Copied" : "Copy string"}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 bg-secondary/20">
                        <code className="text-[13px] font-mono break-all leading-relaxed text-muted-foreground/80 block select-all">
                            {info.userAgent}
                        </code>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
