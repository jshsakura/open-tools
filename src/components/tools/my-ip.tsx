"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MapPin,
    Globe,
    Server,
    Shield,
    RefreshCcw,
    Copy,
    CheckCircle2,
    ExternalLink,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface IpInfo {
    ip: string
    city: string
    region: string
    country_name: string
    org: string
    postal: string
    latitude: number
    longitude: number
    timezone: string
    asn: string
    version: string
}

export function MyIpTool() {
    const t = useTranslations()
    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState<IpInfo | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchIpInfo = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch("https://ipapi.co/json/")
            if (!response.ok) throw new Error("Failed to fetch IP info")
            const data = await response.json()
            setInfo(data)
        } catch (err) {
            setError("Could not retrieve IP information. Please check your connection or try again later.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIpInfo()
    }, [])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main IP Info Card */}
                <Card className="md:col-span-2 overflow-hidden border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                My IP Address
                            </CardTitle>
                            <CardDescription>Your current public networking identity</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchIpInfo}
                            disabled={loading}
                            className="h-8 w-8"
                            title="Refresh"
                        >
                            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center gap-4 text-center">
                                <RefreshCcw className="h-8 w-8 text-muted-foreground/50 animate-spin" />
                                <p className="text-sm text-muted-foreground animate-pulse font-medium">Detecting IP...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        ) : info && (
                            <div className="space-y-8">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/10 p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                        <div className="space-y-2 text-center md:text-left">
                                            <p className="text-xs font-bold text-primary/80 uppercase tracking-wider">Public IPv4</p>
                                            <h2 className="text-4xl md:text-5xl font-black tracking-tight tabular-nums text-foreground">{info.ip}</h2>
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={() => copyToClipboard(info.ip)}
                                            className={cn(
                                                "min-w-[140px] font-semibold shadow-lg transition-all",
                                                copied ? "bg-green-600 hover:bg-green-700" : ""
                                            )}
                                        >
                                            {copied ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
                                            {copied ? "Copied" : "Copy IP"}
                                        </Button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                        <Globe className="w-64 h-64" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                                        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 h-fit">
                                            <Server className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground uppercase">ISP & Network</p>
                                            <p className="font-semibold truncate" title={info.org}>{info.org}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px] h-5">ASN: {info.asn}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                                        <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 shrink-0 h-fit">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground uppercase">Connection</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20">IPv{info.version === 'IPv6' ? '6' : '4'}</Badge>
                                                <Badge variant="outline" className="text-[10px] border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">Secure</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="overflow-hidden border-border bg-card shadow-sm h-full flex flex-col">
                    <CardHeader className="border-b bg-muted/50 py-4 px-6 shrink-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-rose-500/10">
                                <MapPin className="h-5 w-5 text-rose-500" />
                            </div>
                            Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {info ? (
                            <div className="space-y-5">
                                <div className="aspect-video rounded-2xl bg-muted/50 border border-border/10 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                                    <MapPin className="h-10 w-10 text-rose-500 animate-bounce relative z-10" />
                                    <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
                                        {info.latitude}, {info.longitude}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-border/10">
                                        <span className="text-sm font-medium text-muted-foreground">City</span>
                                        <span className="text-sm font-bold">{info.city}, {info.region}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/10">
                                        <span className="text-sm font-medium text-muted-foreground">Country</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{info.country_name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border/10">
                                        <span className="text-sm font-medium text-muted-foreground">Timezone</span>
                                        <span className="text-sm font-bold">{info.timezone}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-muted-foreground">Postal Code</span>
                                        <span className="text-sm font-bold">{info.postal}</span>
                                    </div>
                                </div>

                                <Button variant="secondary" className="w-full gap-2 rounded-xl text-xs font-bold" asChild>
                                    <a href={`https://www.google.com/maps?q=${info.latitude},${info.longitude}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3" />
                                        View on Google Maps
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                {loading ? "Waiting for GPS data..." : "No location data available"}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Info Section */}
            <section className="p-8 rounded-[32px] bg-secondary/20 border border-border/20 backdrop-blur-md">
                <div className="max-w-3xl space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        About Your Privacy
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This tool uses the <strong>ipapi.co</strong> public API to detect your network coordinates.
                        We do not store your IP address or location data on our servers. The identification process is purely client-side and ephemeral.
                        Public IP addresses are assigned by your ISP and can be used to identify your approximate location but usually not your exact home address.
                    </p>
                </div>
            </section>
        </div>
    )
}
