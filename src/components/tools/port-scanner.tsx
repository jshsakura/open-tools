"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    Shield,
    RefreshCcw,
    Play,
    Activity,
    Lock,
    Unlock,
    Info,
    CheckCircle2,
    XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PortResult {
    port: number
    label: string
    status: "checking" | "open" | "closed" | "filtered"
}

const COMMON_PORTS = [
    { port: 21, label: "FTP" },
    { port: 22, label: "SSH" },
    { port: 23, label: "Telnet" },
    { port: 25, label: "SMTP" },
    { port: 53, label: "DNS" },
    { port: 80, label: "HTTP" },
    { port: 443, label: "HTTPS" },
    { port: 3306, label: "MySQL" },
    { port: 5432, label: "PostgreSQL" },
    { port: 6379, label: "Redis" },
    { port: 8080, label: "HTTP-Alt" },
    { port: 27017, label: "MongoDB" }
]

export function PortScannerTool() {
    const t = useTranslations()
    const [target, setTarget] = useState("localhost")
    const [scanning, setScanning] = useState(false)
    const [results, setResults] = useState<PortResult[]>([])

    const scanPort = async (host: string, port: number): Promise<"open" | "closed" | "filtered"> => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)

        const start = performance.now()
        try {
            // Note: Browsers block most non-HTTP ports for fetch. 
            // This is a limited demonstration using fetch behavior.
            // On most browsers, a blocked port will throw a specific error quickly.
            await fetch(`http://${host}:${port}`, {
                mode: 'no-cors',
                signal: controller.signal,
                cache: 'no-store'
            })
            clearTimeout(timeoutId)
            return "open"
        } catch (e: any) {
            clearTimeout(timeoutId)
            const duration = performance.now() - start

            if (e.name === 'AbortError') {
                return "filtered" // Target dropped request or timed out
            }

            // In many browsers, if the connection is refused, it happens extremely fast (< 50ms)
            // If it's a CORS issue but port is open, it might behave differently.
            // This is a heuristic approach for client-side scanning.
            return duration < 100 ? "closed" : "filtered"
        }
    }

    const startScan = async () => {
        setScanning(true)
        const initialResults: PortResult[] = COMMON_PORTS.map(p => ({ ...p, status: "checking" }))
        setResults(initialResults)

        for (let i = 0; i < initialResults.length; i++) {
            const status = await scanPort(target, initialResults[i].port)
            setResults(prev => prev.map((item, idx) => idx === i ? { ...item, status } : item))
        }
        setScanning(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Panel */}
            <Card className="overflow-hidden border-primary/20 bg-card/60 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b border-border/10 bg-muted/30">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                <Search className="h-6 w-6 text-primary" />
                                Target Configuration
                            </CardTitle>
                            <CardDescription>Enter a hostname or IP to scan common services</CardDescription>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <Input
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="localhost or IP..."
                                className="max-w-[200px] rounded-xl border-primary/20 bg-background/50 focus-visible:ring-primary"
                                disabled={scanning}
                            />
                            <Button
                                onClick={startScan}
                                disabled={scanning || !target}
                                className="rounded-xl gap-2 font-bold shadow-lg min-w-[120px]"
                            >
                                {scanning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                                {scanning ? "Scanning..." : "Start Scan"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {results.map((r) => (
                                <div
                                    key={r.port}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                                        r.status === "open" ? "bg-green-500/5 border-green-500/20 shadow-lg shadow-green-500/5" :
                                            r.status === "closed" ? "bg-secondary/30 border-border/10 opacity-60" :
                                                r.status === "filtered" ? "bg-orange-500/5 border-orange-500/20" :
                                                    "bg-secondary/10 border-border/5 animate-pulse"
                                    )}
                                >
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{r.label}</p>
                                        <p className="text-lg font-black tracking-tight tabular-nums leading-none">Port {r.port}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        {r.status === "open" && <Unlock className="h-5 w-5 text-green-500" />}
                                        {r.status === "closed" && <Lock className="h-5 w-5 text-muted-foreground/30" />}
                                        {r.status === "filtered" && <Shield className="h-5 w-5 text-orange-500" />}
                                        {r.status === "checking" && <Activity className="h-5 w-5 text-primary animate-pulse" />}

                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                r.status === "open" ? "border-green-500/30 text-green-500 bg-green-500/10" :
                                                    r.status === "closed" ? "border-border/10 text-muted-foreground/50" :
                                                        r.status === "filtered" ? "border-orange-500/30 text-orange-500 bg-orange-500/10" :
                                                            "border-primary/30 text-primary"
                                            )}
                                        >
                                            {r.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-6 rounded-3xl bg-secondary/50 border border-border/10">
                                <Search className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold">No scan in progress</h4>
                                <p className="text-sm text-muted-foreground">Configure a target and press Start Scan to monitor port availability.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documentation / Legend */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 space-y-3 bg-green-500/5 border-green-500/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Open Status</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The service responded and the connection was accepted. This usually means an application is listening on this port.
                    </p>
                </Card>

                <Card className="p-6 space-y-3 bg-secondary/20 border-border/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Closed Status</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The host responded but explicitly refused the connection. No application is currently listening on this port.
                    </p>
                </Card>

                <Card className="p-6 space-y-3 bg-orange-500/5 border-orange-500/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-orange-500">
                        <Shield className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Filtered / Timeout</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        No response was received within the timeout period. This is often caused by a firewall dropping the packets.
                    </p>
                </Card>
            </div>

            <section className="p-8 rounded-[32px] bg-secondary/20 border border-border/20 backdrop-blur-md">
                <div className="max-w-3xl space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Important Limitation
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Modern browsers impose strict <strong>security restrictions</strong> on network requests.
                        Fetching arbitrary ports is often blocked at the browser level (e.g., ports like 21, 22, 25 are restricted).
                        This tool uses a heuristic timing approach and is best suited for scanning local development servers or publicly accessible HTTP/HTTPS ports.
                        For a professional security audit, always use dedicated tools like <code>nmap</code>.
                    </p>
                </div>
            </section>
        </div>
    )
}
