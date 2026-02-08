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
    const t = useTranslations("PortScanner")
    const [target, setTarget] = useState("localhost")
    const [scanning, setScanning] = useState(false)
    const [results, setResults] = useState<PortResult[]>([])

    const scanPort = async (host: string, port: number): Promise<"open" | "closed" | "filtered"> => {
        try {
            const res = await fetch('/api/port-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, port })
            });

            if (!res.ok) throw new Error("Scan failed");

            const data = await res.json();
            return data.status || "filtered";
        } catch (e) {
            return "filtered";
        }
    }

    const startScan = async () => {
        setScanning(true)
        const initialResults: PortResult[] = COMMON_PORTS.map(p => ({ ...p, status: "checking" }))
        setResults(initialResults)

        // Scan in batches of 3 to avoid overwhelming the server or browser connection limits
        const BATCH_SIZE = 3;
        for (let i = 0; i < initialResults.length; i += BATCH_SIZE) {
            const batch = initialResults.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (item, batchIdx) => {
                const realIdx = i + batchIdx;
                const status = await scanPort(target, item.port);
                setResults(prev => prev.map((r, idx) => idx === realIdx ? { ...r, status } : r));
            }));
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
                                {t("targetTitle")}
                            </CardTitle>
                            <CardDescription>{t("targetDesc")}</CardDescription>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <Input
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder={t("placeholder")}
                                className="max-w-[200px] rounded-xl border-primary/20 bg-background/50 focus-visible:ring-primary"
                                disabled={scanning}
                            />
                            <Button
                                onClick={startScan}
                                disabled={scanning || !target}
                                className="rounded-xl gap-2 font-bold shadow-lg min-w-[120px]"
                            >
                                {scanning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                                {scanning ? t("scanning") : t("start")}
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
                                            {t(`status.${r.status}`)}
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
                                <h4 className="font-bold">{t("noScan")}</h4>
                                <p className="text-sm text-muted-foreground">{t("noScanDesc")}</p>
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
                        <h4 className="font-bold text-sm">{t("legend.openTitle")}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("legend.openDesc")}
                    </p>
                </Card>

                <Card className="p-6 space-y-3 bg-secondary/20 border-border/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-5 w-5" />
                        <h4 className="font-bold text-sm">{t("legend.closedTitle")}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("legend.closedDesc")}
                    </p>
                </Card>

                <Card className="p-6 space-y-3 bg-orange-500/5 border-orange-500/10 rounded-[24px]">
                    <div className="flex items-center gap-2 text-orange-500">
                        <Shield className="h-5 w-5" />
                        <h4 className="font-bold text-sm">{t("legend.filteredTitle")}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("legend.filteredDesc")}
                    </p>
                </Card>
            </div>

            <section className="p-8 rounded-[32px] bg-secondary/20 border border-border/20 backdrop-blur-md">
                <div className="max-w-3xl space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        {t("limitation.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("limitation.content")}
                    </p>
                </div>
            </section>
        </div>
    )
}
