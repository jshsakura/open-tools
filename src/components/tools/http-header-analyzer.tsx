"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Globe, Activity, Copy, CheckCircle2, Shield, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { extractUrlishInput } from "@/lib/url-input"

interface HeaderResult {
    status: number
    statusText: string
    url: string
    headers: Record<string, string>
}

const SECURITY_HEADERS: Record<string, { weight: number; description: string }> = {
    "strict-transport-security": { weight: 15, description: "HSTS" },
    "content-security-policy": { weight: 20, description: "CSP" },
    "x-frame-options": { weight: 10, description: "X-Frame-Options" },
    "x-content-type-options": { weight: 10, description: "X-Content-Type-Options" },
    "x-xss-protection": { weight: 5, description: "X-XSS-Protection" },
    "referrer-policy": { weight: 10, description: "Referrer-Policy" },
    "permissions-policy": { weight: 10, description: "Permissions-Policy" },
    "x-permitted-cross-domain-policies": { weight: 5, description: "X-Permitted-Cross-Domain" },
    "cross-origin-embedder-policy": { weight: 5, description: "COEP" },
    "cross-origin-opener-policy": { weight: 5, description: "COOP" },
    "cross-origin-resource-policy": { weight: 5, description: "CORP" },
}

function calculateSecurityScore(headers: Record<string, string>): number {
    const lowerHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
    )
    let score = 0
    const totalWeight = Object.values(SECURITY_HEADERS).reduce((a, b) => a + b.weight, 0)

    for (const [header, config] of Object.entries(SECURITY_HEADERS)) {
        if (lowerHeaders[header]) {
            score += config.weight
        }
    }

    return Math.round((score / totalWeight) * 100)
}

function getGrade(score: number): { grade: string; color: string; bgColor: string } {
    if (score >= 90) return { grade: "A+", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" }
    if (score >= 80) return { grade: "A", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" }
    if (score >= 70) return { grade: "B", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" }
    if (score >= 50) return { grade: "C", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" }
    if (score >= 30) return { grade: "D", color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" }
    return { grade: "F", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" }
}

function isSecurityHeader(key: string): boolean {
    return key.toLowerCase() in SECURITY_HEADERS
}

export function HttpHeaderAnalyzerTool() {
    const t = useTranslations("HttpHeaderAnalyzer")
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<HeaderResult | null>(null)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    const analyze = useCallback(async () => {
        let targetUrl = extractUrlishInput(url)
        if (!targetUrl) return

        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = "https://" + targetUrl
        }

        setUrl(targetUrl)

        setLoading(true)
        setError("")
        setResult(null)

        try {
            const res = await fetch(`/api/header-check?url=${encodeURIComponent(targetUrl)}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || t("errorFetch"))
                return
            }

            setResult(data)
        } catch {
            setError(t("errorFetch"))
        } finally {
            setLoading(false)
        }
    }, [url, t])

    const copyAllHeaders = useCallback(() => {
        if (!result) return
        const text = Object.entries(result.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }, [result, t])

    const score = result ? calculateSecurityScore(result.headers) : 0
    const grade = getGrade(score)

    const securityHeaders = result
        ? Object.entries(result.headers).filter(([k]) => isSecurityHeader(k))
        : []

    const otherHeaders = result
        ? Object.entries(result.headers).filter(([k]) => !isSecurityHeader(k))
        : []

    const missingSecurityHeaders = result
        ? Object.entries(SECURITY_HEADERS).filter(
              ([key]) => !Object.keys(result.headers).some((k) => k.toLowerCase() === key)
          )
        : []

    return (
        <div className="space-y-6">
            {/* URL Input */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder={t("placeholder")}
                                className="pl-10"
                                onKeyDown={(e) => e.key === "Enter" && analyze()}
                            />
                        </div>
                        <Button onClick={analyze} disabled={loading || !url.trim()}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Activity className="h-4 w-4 mr-2" />
                            )}
                            {t("analyzeBtn")}
                        </Button>
                    </div>
                    {error && <p className="text-sm text-destructive mt-3">{error}</p>}
                </CardContent>
            </Card>

            {result && (
                <>
                    {/* Status & Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">{t("status")}</p>
                                <p className={cn("text-2xl font-bold", result.status < 400 ? "text-green-500" : "text-red-500")}>
                                    {result.status} {result.statusText}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">{t("securityScore")}</p>
                                <p className={cn("text-3xl font-bold", grade.color)}>{score}/100</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">{t("grade")}</p>
                                <div className={cn("inline-flex items-center justify-center w-14 h-14 rounded-full text-2xl font-bold", grade.bgColor, grade.color)}>
                                    {grade.grade}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Headers */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    {t("securityHeaders")}
                                </h3>
                                <Badge variant="outline" className="text-green-600">
                                    {securityHeaders.length}/{Object.keys(SECURITY_HEADERS).length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {securityHeaders.map(([key, value]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                                            <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400 shrink-0">{key}</span>
                                        </div>
                                        <span className="font-mono text-xs text-muted-foreground break-all sm:ml-auto sm:text-right max-w-full sm:max-w-[60%]">{value}</span>
                                    </div>
                                ))}
                                {missingSecurityHeaders.map(([key]) => (
                                    <div key={key} className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                                        <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                                        <span className="font-mono text-sm font-semibold text-red-700 dark:text-red-400">{key}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{t("missing")}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* All Headers */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    {t("allHeaders")}
                                    <Badge variant="secondary">{Object.keys(result.headers).length}</Badge>
                                </h3>
                                <Button variant="outline" size="sm" onClick={copyAllHeaders}>
                                    {copied ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                                    {copied ? t("copied") : t("copyAll")}
                                </Button>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left px-4 py-2 font-medium">{t("headerName")}</th>
                                            <th className="text-left px-4 py-2 font-medium">{t("headerValue")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {otherHeaders.map(([key, value]) => (
                                            <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-2 font-mono text-xs font-semibold whitespace-nowrap">{key}</td>
                                                <td className="px-4 py-2 font-mono text-xs text-muted-foreground break-all">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
