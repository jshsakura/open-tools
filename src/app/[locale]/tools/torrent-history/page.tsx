"use client"


import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Fingerprint, ShieldAlert, CheckCircle, Smartphone, Wifi, Globe, Lock, Info, Server, Clock, MapPin, Activity, Search, Shield } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"



export default function TorrentHistoryPage() {
    const t = useTranslations("TorrentHistory")
    const tool = getToolById('torrent-history');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'result'>('idle')
    const [progress, setProgress] = useState(0)
    const [logs, setLogs] = useState<Array<string>>([])
    const [data, setData] = useState<{ ip: string, isp?: string, geo?: any, downloads: any[], riskScore: number, riskLevel: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(0)

    // Timer Logic - Continuous Countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Initial Load Check
    useEffect(() => {
        const lastScan = localStorage.getItem('last_torrent_scan');
        if (lastScan) {
            const passed = Date.now() - parseInt(lastScan);
            if (passed < 300000) { // 5 minutes
                setTimeLeft(Math.ceil((300000 - passed) / 1000));
            }
        }
    }, []);

    // Fetch localized logs
    const scanLogs = [
        t("scanning.logs.0"),
        t("scanning.logs.1"),
        t("scanning.logs.2"),
        t("scanning.logs.3"),
        t("scanning.logs.4"),
        t("scanning.logs.5"),
        t("scanning.logs.6")
    ]

    const startScan = async () => {
        // 1. Check Cache (5 min cooldown)
        if (data?.ip) {
            const cached = localStorage.getItem(`torrent_history_${data.ip}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.timestamp;
                const COOLDOWN = 5 * 60 * 1000; // 5 minutes

                if (age < COOLDOWN) {
                    setData(parsed.data);
                    setStatus('result');
                    const remaining = COOLDOWN - age;
                    setTimeLeft(Math.ceil(remaining / 1000));
                    toast.success(t("results.cached", {
                        minutes: Math.floor(remaining / 60000),
                        seconds: Math.floor((remaining % 60000) / 1000)
                    }));
                    return;
                }
            }
        }

        setStatus('scanning')
        setProgress(0)
        setLogs([])
        setError(null)
        setData(null)

        // Set cooldown immediately
        localStorage.setItem('last_torrent_scan', Date.now().toString())
        setTimeLeft(300)

        // 1. Start Fetch Immediately
        const fetchPromise = fetch('/api/torrent-history')
            .then(async res => {
                const data = await res.json();
                return { ok: res.ok, data };
            })
            .catch(err => ({ ok: false, error: err }));

        let isDataReady = false;
        let fetchResult: any = null;

        // Handle Fetch Completion in Background
        fetchPromise.then(result => {
            fetchResult = result;
            isDataReady = true;
        });

        // 2. Run Animation
        for (let i = 0; i <= 90; i += 2) {
            // Check if we should fast-forward
            if (isDataReady) {
                break; // Exit loop to jump to 100%
            }

            setProgress(i);

            // Add logs occasionally
            if (i % 15 === 0) {
                setLogs(prev => [...prev, scanLogs[Math.floor(i / 15)] || t("scanning.label")]);
            }

            // Variable speed: faster at start, slower near 90%
            const delay = i > 70 ? 100 : 30;
            await new Promise(r => setTimeout(r, delay));
        }

        // 3. Wait for data if not ready yet (at 90%)
        if (!isDataReady) {
            setLogs(prev => [...prev, t("scanning.logs.7")]); // "Finalizing..."
            while (!isDataReady) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // 4. Fast forward to 100%
        setProgress(100);
        await new Promise(r => setTimeout(r, 200));

        // 5. Process Result
        try {
            const { ok, data, error } = fetchResult;

            if (!ok) {
                throw new Error(data?.error || data?.debugLog?.join(' | ') || error?.message || "Failed to fetch history");
            }

            if (data.error === "BLOCKED") {
                setError("BLOCKED")
                setData(data)
                setStatus('result')
                return
            }

            setData(data)
            setStatus('result')
        } catch (err: any) {
            console.error(err)
            const errorMsg = err instanceof Error ? err.message : "Failed to retrieve data";
            setError(`${errorMsg}. Please try again.`);
            setStatus('idle')
        }
    }

    // Known Hosting/VPN ISPs (simple check, can be expanded)
    const isVpnDetected = (isp: string) => {
        const vpnKeywords = ['hosting', 'datacenter', 'cloud', 'vpn', 'proxy', 'digitalocean', 'aws', 'google', 'm247', 'oracle'];
        return vpnKeywords.some(k => isp.toLowerCase().includes(k));
    }

    // Check for cached data on mount/IP detection
    // Check for cached data on mount/IP detection
    useEffect(() => {
        const resolveIp = async () => {
            try {
                // Get IP first
                const res = await fetch('https://api.ipify.org?format=json');
                const { ip } = await res.json();

                if (ip) {
                    // Update initial state with IP only
                    setData(prev => prev ? { ...prev, ip } : {
                        ip,
                        isp: undefined,
                        geo: undefined,
                        downloads: [],
                        riskScore: 0,
                        riskLevel: 'Unknown'
                    });
                }
            } catch (e) {
                console.error("Failed to fetch initial IP", e);
            }
        };
        resolveIp();
    }, []);

    // Save to cache on success
    useEffect(() => {
        if (status === 'result' && data?.ip && !error) {
            localStorage.setItem(`torrent_history_${data.ip}`, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        }
    }, [status, data, error]);

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                {tool && (
                    <ToolPageHeader
                        title={t('title')}
                        description={t('description')}
                        icon={tool.icon}
                        colorClass={tool.color}
                    />
                )}
            </div>

            <div className="grid gap-8">
                    {/* Main Scanner Card */}
                    <Card className="border-none bg-transparent shadow-none overflow-visible relative min-h-[400px]">
                        {/* Glow effect behind content to avoid 'boxy' look */}
                        <div className="absolute inset-0 bg-blue-500/5 dark:bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
                        {/* Scanning Line Effect (Soft Warmth) */}
                        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 dark:opacity-30 dark:shadow-[0_0_20px_#f97316]" />

                        <CardContent className="p-8 md:px-12 md:pb-6 md:pt-4 flex flex-col items-center min-h-[400px] relative z-20 bg-transparent">
                            <AnimatePresence mode="wait">
                                {status === 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                        className="flex flex-col items-center gap-12 w-full"
                                    >
                                        {/* Cyber Radar View (Idle) */}
                                        <div className="relative w-72 h-72 flex items-center justify-center group cursor-pointer" onClick={startScan}>
                                            {/* Outer Rings - Subtle in light mode */}
                                            <div className="absolute inset-0 rounded-full border border-blue-500/10 dark:border-orange-500/10 animate-[spin_10s_linear_infinite]" />
                                            <div className="absolute inset-4 rounded-full border border-blue-500/20 dark:border-orange-500/20 border-dashed animate-[spin_20s_linear_infinite_reverse]" />
                                            <div className="absolute inset-10 rounded-full border border-blue-500/10 dark:border-orange-500/10" />

                                            {/* Pulse Effects */}
                                            <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 dark:border-orange-500/10 animate-[ping_3s_ease-in-out_infinite]" />
                                            <div className="absolute inset-0 rounded-full bg-blue-500/5 dark:bg-orange-500/5 animate-pulse" />

                                            {/* Rotating Scan Line */}
                                            <div className="absolute inset-0 rounded-full w-full h-full animate-[spin_3s_linear_infinite] bg-gradient-to-tr from-transparent via-transparent to-blue-500/10 dark:to-orange-500/10" />

                                            {/* Center Button */}
                                            <div className={`relative z-10 bg-transparent dark:!bg-stone-900/10 p-8 rounded-full border border-blue-100/50 dark:!border-orange-500/30 shadow-xl shadow-blue-500/5 dark:shadow-[0_0_40px_rgba(249,115,22,0.15)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-blue-500/20 dark:group-hover:shadow-[0_0_60px_rgba(249,115,22,0.25)]`}>
                                                <Fingerprint className="w-20 h-20 text-blue-600 dark:!text-orange-500 drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                            </div>

                                            <div className="absolute -bottom-20 flex flex-col items-center gap-3 w-full text-center">
                                                <div className="font-mono text-sm text-blue-600/80 dark:text-orange-500/80 tracking-[0.2em] uppercase animate-pulse">
                                                    Target Detected
                                                </div>
                                                <div className="px-6 py-2 bg-transparent dark:bg-stone-900/50 border border-blue-100/50 dark:border-orange-500/20 rounded text-xl font-black tracking-widest text-foreground dark:text-stone-200">
                                                    {data?.ip || t("systemReady")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-8 pt-12 z-20">
                                            <p className="text-sm text-muted-foreground font-mono tracking-tight max-w-[600px] w-full mx-auto leading-relaxed opacity-70">
                                                {t("notice")}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {status === 'scanning' && (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full max-w-lg space-y-10"
                                    >
                                        <div className="relative w-40 h-40 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-muted" />
                                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                            <div className="absolute inset-4 rounded-full border-2 border-primary/30 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
                                            <div className="absolute inset-0 flex items-center justify-center font-mono text-4xl font-black text-primary drop-shadow-lg">
                                                {progress}%
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="font-mono text-sm space-y-3 h-48 overflow-hidden border border-blue-500/10 dark:!border-stone-800/30 bg-transparent dark:!bg-stone-900/20 p-6 rounded-lg relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 dark:!bg-orange-500/50" />
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] dark:bg-[linear-gradient(transparent_0%,rgba(249,115,22,0.05)_50%,transparent_100%)] animate-[scan_2s_linear_infinite]" />

                                                {logs.map((log, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center gap-3 text-muted-foreground"
                                                    >
                                                        <span className="text-blue-500 dark:text-orange-500 text-xs">▶</span> {log}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {status === 'result' && data && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full space-y-8"
                                    >
                                        {/* Result Header */}
                                        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-blue-500/5 dark:!bg-stone-900/20 p-6 rounded-xl border border-border/50 dark:!border-stone-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20 dark:!bg-orange-500/10 dark:!text-orange-500 dark:!border-orange-500/20">
                                                    <Globe className="w-8 h-8" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{t("results.ipLabel")}</div>
                                                    <div className="text-3xl font-mono font-black text-foreground tracking-tight">{data.ip}</div>
                                                </div>
                                            </div>

                                            {data.isp && (
                                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                                    <div className="text-right hidden md:block">
                                                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{t("results.ispLabel")}</div>
                                                        <div className="text-xl font-bold text-foreground">{data.isp}</div>
                                                    </div>
                                                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20">
                                                        <Server className="w-6 h-6" />
                                                    </div>
                                                    {/* Mobile Only ISP Text */}
                                                    <div className="md:hidden text-left">
                                                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{t("results.ispLabel")}</div>
                                                        <div className="text-xl font-bold text-foreground">{data.isp}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isVpnDetected(data.isp || '') && (
                                            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                                                <Info className="h-5 w-5" />
                                                <AlertTitle className="text-blue-700 dark:text-blue-300 font-bold ml-2">VPN Detected</AlertTitle>
                                                <AlertDescription className="ml-2 mt-1 opacity-90">
                                                    {t("results.vpnDetected")}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Blocked Error */}
                                        {error === "BLOCKED" && (
                                            <div className="text-center py-16 border border-orange-500/30 rounded-2xl bg-orange-500/5 space-y-6 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
                                                <div className="relative z-10 w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-orange-500/50 shadow-lg">
                                                    <ShieldAlert className="w-12 h-12 text-primary mb-4" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-3xl font-black text-orange-600 dark:text-orange-500 mb-3 tracking-tight">{t("results.blocked")}</h3>
                                                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                                                        {t("results.blockedDesc")}
                                                    </p>
                                                </div>
                                                <Button
                                                    asChild
                                                    className="relative z-10 bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 px-8"
                                                >
                                                    <a href="https://iknowwhatyoudownload.com/" target="_blank" rel="noopener noreferrer">
                                                        {t("results.manualCheck")}
                                                    </a>
                                                </Button>
                                            </div>
                                        )}

                                        {error !== "BLOCKED" && (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Network Identity Card */}
                                                    <div className="p-8 rounded-2xl border border-border bg-transparent flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

                                                        {/* Geo & Network Info */}
                                                        <div className="w-full space-y-3 z-10">
                                                            {data.geo && (
                                                                <div className="flex items-center justify-between text-sm p-3 bg-transparent dark:bg-stone-900/50 rounded-lg border border-border/50">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span>{t("results.location")}</span>
                                                                    </div>
                                                                    <div className="font-bold flex items-center gap-2 text-foreground">
                                                                        <span>{data.geo.city}, {data.geo.country}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {data.geo?.asn && (
                                                                <div className="flex items-center justify-between text-sm p-3 bg-transparent dark:bg-stone-900/50 rounded-lg border border-border/50">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <Activity className="w-4 h-4" />
                                                                        <span>ASN</span>
                                                                    </div>
                                                                    <div className="font-bold font-mono text-foreground">{data.geo.asn.split(' ')[0]}</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>

                                                    {/* Risk Score */}
                                                    <div className={`p-8 rounded-2xl border ${data.riskLevel === 'Safe' ? 'border-green-500/30 bg-green-500/10' : data.riskLevel === 'Low' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-red-600/50 bg-red-500/10'} flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
                                                        <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,${data.riskLevel === 'Safe' ? '#22c55e' : '#dc2626'},transparent_70%)] group-hover:opacity-30 transition-opacity`} />
                                                        <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-60 mb-4 text-foreground">{t("results.riskAnalysis")}</div>
                                                        <div className="text-6xl font-black mb-4 flex items-baseline gap-2 text-foreground">
                                                            {data.riskScore || 0}<span className="text-xl opacity-50 relative -top-6">/100</span>
                                                        </div>
                                                        <div className={`text-sm font-bold px-4 py-1.5 rounded-full border ${data.riskLevel === 'Safe' ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400' : data.riskLevel === 'Low' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'bg-red-600/20 border-red-500 text-red-600 dark:text-red-500 animate-pulse'}`}>
                                                            {t(`results.riskLevels.${data.riskLevel}`)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Download List */}
                                                {data.downloads && data.downloads.length > 0 ? (
                                                    <div className="bg-transparent border border-border rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
                                                        <div className="bg-red-500/10 p-5 border-b border-red-500/20 flex items-center justify-between">
                                                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                                                                <ShieldAlert className="w-5 h-5" />
                                                                <span>{t("results.suspiciousFound", { count: data.downloads.length })}</span>
                                                            </div>
                                                            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                                        </div>
                                                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-transparent text-muted-foreground font-medium border-b border-border sticky top-0 uppercase text-xs tracking-wider">
                                                                    <tr>
                                                                        <th className="p-5 pl-6">{t("results.columns.content")}</th>
                                                                        <th className="p-5 w-32 text-right pr-6">{t("results.columns.date")}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-border">
                                                                    {data.downloads.map((item: any, i: number) => (
                                                                        <tr
                                                                            key={i}
                                                                            className={`transition-colors ${item.isSensitive ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-blue-500/5'}`}
                                                                        >
                                                                            <td className="p-5 pl-6">
                                                                                <div className="flex items-start gap-4">
                                                                                    <div className={`mt-1 p-1.5 rounded ${item.isSensitive ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-500/5 text-muted-foreground border border-border/50'}`}>
                                                                                        {item.isSensitive ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className={`font-medium line-clamp-2 md:line-clamp-none ${item.isSensitive ? 'text-red-600 dark:text-red-300' : 'text-foreground'}`} title={item.title}>
                                                                                            {item.title}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 mt-2">
                                                                                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/5 text-muted-foreground border border-border font-mono">
                                                                                                {item.size || 'N/A'}
                                                                                            </span>
                                                                                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                                                                                {item.category || 'Unknown'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-5 text-right pr-6 whitespace-nowrap text-muted-foreground font-mono text-xs">{item.date}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-20 border border-dashed border-green-500/30 rounded-2xl bg-green-500/5 space-y-6">
                                                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 ring-1 ring-green-500/50 shadow-lg">
                                                            <CheckCircle className="w-12 h-12" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-green-600 dark:text-green-400 mb-2 tracking-tight">{t("results.cleanTitle")}</h3>
                                                            <p className="text-muted-foreground max-w-md mx-auto">
                                                                {t("results.cleanDesc")}
                                                            </p>
                                                        </div>
                                                        <div className="inline-block">
                                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30">
                                                                {t("results.cleanWarning")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}



                                        {/* Disabled "Another Network" Button logic - user requested removal of external check encouragement */}
                                        {/* We only show a reset button if they want to clear view */}
                                        {timeLeft > 0 && (
                                            <div className="mt-8 relative overflow-hidden rounded-xl bg-transparent dark:bg-stone-900/50 border border-slate-200/50 dark:border-stone-800 p-4">
                                                <div className="flex items-center justify-between relative z-10 mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500 dark:text-orange-500" />
                                                        {t('results.cached', { minutes: Math.floor(timeLeft / 60), seconds: timeLeft % 60 })}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-foreground bg-transparent dark:bg-stone-800 px-2 py-1 rounded">
                                                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-blue-500/5 dark:bg-stone-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-orange-500 dark:to-red-500"
                                                        initial={{ width: "100%" }}
                                                        animate={{ width: `${(timeLeft / 300) * 100}%` }}
                                                        transition={{ duration: 1, ease: "linear" }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>

                        {/* Guide & Disclaimer */}
                        <div className="p-8 md:px-12 md:py-4 border-t border-border/10 dark:!border-stone-800/30 bg-transparent relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none" />
                            <div className="grid gap-6">
                                <div className="bg-transparent dark:!bg-stone-950/30 backdrop-blur-md border border-slate-200 dark:!border-stone-800 rounded-2xl p-8 space-y-6 text-left shadow-sm">
                                    <h3 className="flex items-center gap-3 font-bold text-xl text-foreground">
                                        <Lock className="w-6 h-6 text-blue-600 dark:!text-orange-500" />
                                        {t("guide.title")}
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground">
                                        <div className="space-y-3">
                                            <p className="font-bold text-foreground">{t("guide.whyVpn")}</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600 dark:!text-orange-500 mt-1">✓</span> {t("guide.whyVpnList.0")}
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600 dark:!text-orange-500 mt-1">✓</span> {t("guide.whyVpnList.1")}
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-600 dark:!text-orange-500 mt-1">✓</span> {t("guide.whyVpnList.2")}
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="font-bold text-foreground">{t("guide.policy")}</p>
                                            <p className="leading-relaxed">
                                                {t("guide.policyDesc")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <Alert className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-500">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <AlertTitle className="text-amber-800 dark:text-amber-500 font-bold ml-2">{t("disclaimer.title")}</AlertTitle>
                                    <AlertDescription className="ml-2 mt-1 text-xs opacity-90 leading-relaxed">
                                        {t("disclaimer.content")}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
