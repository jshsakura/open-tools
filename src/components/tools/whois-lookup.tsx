"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Globe, Search, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { extractDomainInput } from "@/lib/url-input"

interface DnsResult {
    domain: string
    a?: string[]
    aaaa?: string[]
    mx?: Array<{ exchange: string; priority: number }>
    ns?: string[]
    txt?: string[][]
    soa?: {
        nsname: string
        hostmaster: string
        serial: number
        refresh: number
        retry: number
        expire: number
        minttl: number
    }
    error?: string
}

export function WhoisLookupTool() {
    const t = useTranslations("WhoisLookup")
    const [domain, setDomain] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<DnsResult | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const handleLookup = useCallback(async () => {
        const cleaned = extractDomainInput(domain)
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .trim()
        if (!cleaned) {
            toast.error(t("emptyDomain"))
            return
        }

        setDomain(cleaned)
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch(`/api/whois?domain=${encodeURIComponent(cleaned)}`)
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || t("lookupError"))
                return
            }
            setResult(data)
        } catch {
            toast.error(t("lookupError"))
        } finally {
            setLoading(false)
        }
    }, [domain, t])

    const copyText = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(t("copied"))
        setTimeout(() => setCopiedField(null), 2000)
    }

    const CopyBtn = ({ text, field }: { text: string; field: string }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyText(text, field)}
        >
            {copiedField === field ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
        </Button>
    )

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Input */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder={t("placeholder")}
                                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                            />
                        </div>
                        <Button onClick={handleLookup} disabled={loading}>
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4 mr-2" />
                            )}
                            {t("lookup")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <div className="space-y-4">
                    {/* Domain header */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Globe className="w-6 h-6 text-teal-600" />
                                <div>
                                    <h3 className="text-lg font-bold">{result.domain}</h3>
                                    <p className="text-sm text-muted-foreground">{t("dnsResults")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* A Records */}
                        {result.a && result.a.length > 0 && (
                            <Card>
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("aRecords")}</Label>
                                    <div className="space-y-2">
                                        {result.a.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 text-sm font-mono">
                                                <span>{r}</span>
                                                <CopyBtn text={r} field={`a-${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* AAAA Records */}
                        {result.aaaa && result.aaaa.length > 0 && (
                            <Card>
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("aaaaRecords")}</Label>
                                    <div className="space-y-2">
                                        {result.aaaa.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 text-sm font-mono">
                                                <span className="break-all">{r}</span>
                                                <CopyBtn text={r} field={`aaaa-${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* NS Records */}
                        {result.ns && result.ns.length > 0 && (
                            <Card>
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("nsRecords")}</Label>
                                    <div className="space-y-2">
                                        {result.ns.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 text-sm font-mono">
                                                <span>{r}</span>
                                                <CopyBtn text={r} field={`ns-${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* MX Records */}
                        {result.mx && result.mx.length > 0 && (
                            <Card>
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("mxRecords")}</Label>
                                    <div className="space-y-2">
                                        {result.mx.map((r, i) => (
                                            <div key={i} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 text-sm font-mono">
                                                <span>{t("priority")}: {r.priority} - {r.exchange}</span>
                                                <CopyBtn text={`${r.priority} ${r.exchange}`} field={`mx-${i}`} />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TXT Records */}
                        {result.txt && result.txt.length > 0 && (
                            <Card className="md:col-span-2">
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("txtRecords")}</Label>
                                    <div className="space-y-2">
                                        {result.txt.map((r, i) => {
                                            const joined = r.join("")
                                            return (
                                                <div key={i} className="flex items-start justify-between bg-secondary/30 rounded px-3 py-2 text-sm font-mono gap-2">
                                                    <span className="break-all flex-1">{joined}</span>
                                                    <CopyBtn text={joined} field={`txt-${i}`} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* SOA Record */}
                        {result.soa && (
                            <Card className="md:col-span-2">
                                <CardContent className="p-5">
                                    <Label className="text-sm font-semibold mb-3 block">{t("soaRecord")}</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: t("soaPrimaryNs"), value: result.soa.nsname },
                                            { label: t("soaHostmaster"), value: result.soa.hostmaster },
                                            { label: t("soaSerial"), value: String(result.soa.serial) },
                                            { label: t("soaRefresh"), value: `${result.soa.refresh}s` },
                                            { label: t("soaRetry"), value: `${result.soa.retry}s` },
                                            { label: t("soaExpire"), value: `${result.soa.expire}s` },
                                            { label: t("soaMinTtl"), value: `${result.soa.minttl}s` },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-secondary/30 rounded p-3">
                                                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                                                <div className="text-sm font-mono flex items-center gap-1">
                                                    <span className="break-all flex-1">{item.value}</span>
                                                    <CopyBtn text={item.value} field={`soa-${i}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* No records found */}
                    {!result.a?.length && !result.aaaa?.length && !result.ns?.length && !result.mx?.length && !result.txt?.length && !result.soa && (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                {t("noRecords")}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
