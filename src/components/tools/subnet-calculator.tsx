"use client"

import { useState, useMemo, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, Trash2, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function ipToLong(ip: string): number {
    const parts = ip.split(".").map(Number)
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function longToIp(num: number): string {
    return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join(".")
}

function isValidIp(ip: string): boolean {
    const parts = ip.split(".")
    if (parts.length !== 4) return false
    return parts.every(p => {
        const n = parseInt(p, 10)
        return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
    })
}

function getIpClass(ip: string): string {
    const first = parseInt(ip.split(".")[0], 10)
    if (first >= 1 && first <= 126) return "A"
    if (first === 127) return "Loopback"
    if (first >= 128 && first <= 191) return "B"
    if (first >= 192 && first <= 223) return "C"
    if (first >= 224 && first <= 239) return "D"
    return "E"
}

interface SubnetResult {
    networkAddress: string
    broadcastAddress: string
    subnetMask: string
    wildcardMask: string
    numberOfHosts: number
    firstUsable: string
    lastUsable: string
    ipClass: string
    cidr: number
}

function calculateSubnet(ip: string, cidr: number): SubnetResult | null {
    if (!isValidIp(ip) || cidr < 0 || cidr > 32) return null

    const ipLong = ipToLong(ip)
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0
    const wildcard = (~mask) >>> 0
    const network = (ipLong & mask) >>> 0
    const broadcast = (network | wildcard) >>> 0
    const numberOfHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2
    const firstUsable = cidr >= 31 ? network : network + 1
    const lastUsable = cidr >= 31 ? broadcast : broadcast - 1

    return {
        networkAddress: longToIp(network),
        broadcastAddress: longToIp(broadcast),
        subnetMask: longToIp(mask),
        wildcardMask: longToIp(wildcard),
        numberOfHosts: Math.max(0, numberOfHosts),
        firstUsable: longToIp(firstUsable),
        lastUsable: longToIp(lastUsable),
        ipClass: getIpClass(ip),
        cidr
    }
}

export function SubnetCalculatorTool() {
    const t = useTranslations('SubnetCalculator')
    const [ipInput, setIpInput] = useState("192.168.1.0")
    const [cidr, setCidr] = useState(24)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const result = useMemo(() => calculateSubnet(ipInput, cidr), [ipInput, cidr])

    const copyToClipboard = useCallback((text: string, field: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(t('copied'))
        setTimeout(() => setCopiedField(null), 2000)
    }, [t])

    const handleCidrInput = (val: string) => {
        // Allow typing in the input: parse from "192.168.1.0/24" format
        if (val.includes("/")) {
            const parts = val.split("/")
            setIpInput(parts[0])
            const c = parseInt(parts[1], 10)
            if (!isNaN(c) && c >= 0 && c <= 32) setCidr(c)
        } else {
            setIpInput(val)
        }
    }

    const resultRows = result ? [
        { label: t('networkAddress'), value: result.networkAddress, key: "net" },
        { label: t('broadcastAddress'), value: result.broadcastAddress, key: "bcast" },
        { label: t('subnetMask'), value: result.subnetMask, key: "mask" },
        { label: t('wildcardMask'), value: result.wildcardMask, key: "wild" },
        { label: t('numberOfHosts'), value: result.numberOfHosts.toLocaleString(), key: "hosts" },
        { label: t('firstUsable'), value: result.firstUsable, key: "first" },
        { label: t('lastUsable'), value: result.lastUsable, key: "last" },
        { label: t('ipClass'), value: result.ipClass, key: "class" },
    ] : []

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard className="p-6">
                <div className="space-y-6">
                    {/* Input Section */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label>{t('ipLabel')}</Label>
                            <Input
                                value={ipInput}
                                onChange={(e) => handleCidrInput(e.target.value)}
                                placeholder={t('ipPlaceholder')}
                                className="font-mono"
                            />
                        </div>
                        <div className="w-32 space-y-2">
                            <Label>{t('cidrLabel')}</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">/</span>
                                <Input
                                    type="number"
                                    min={0}
                                    max={32}
                                    value={cidr}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value, 10)
                                        if (!isNaN(v) && v >= 0 && v <= 32) setCidr(v)
                                    }}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => { setIpInput(""); setCidr(24) }}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* CIDR Slider */}
                    <div className="space-y-2">
                        <Label className="text-xs">{t('cidrSlider')}</Label>
                        <input
                            type="range"
                            min={0}
                            max={32}
                            value={cidr}
                            onChange={(e) => setCidr(parseInt(e.target.value, 10))}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>/0</span>
                            <span>/8</span>
                            <span>/16</span>
                            <span>/24</span>
                            <span>/32</span>
                        </div>
                    </div>

                    {!isValidIp(ipInput) && ipInput.trim() && (
                        <p className="text-sm text-destructive">{t('invalidIp')}</p>
                    )}
                </div>
            </GlassCard>

            {/* Results */}
            {result && (
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Network className="h-5 w-5 text-cyan-600" />
                        {t('results')}
                        <span className="text-sm font-mono text-muted-foreground ml-2">
                            {ipInput}/{cidr}
                        </span>
                    </h3>
                    <div className="divide-y divide-border">
                        {resultRows.map(({ label, value, key }) => (
                            <div key={key} className="flex items-center justify-between py-3">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-medium">{value}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => copyToClipboard(value, key)}
                                    >
                                        {copiedField === key
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            : <Copy className="h-3.5 w-3.5" />
                                        }
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
