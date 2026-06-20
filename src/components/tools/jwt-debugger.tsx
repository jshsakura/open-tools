"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from 'next-intl'
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { jwtDecode } from "jwt-decode"
import {
    AlertCircle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Key,
    FileJson,
    ShieldCheck,
    Database,
    Lock,
    Clock,
} from "lucide-react"

const formatJson = (value: any) => JSON.stringify(value, null, 2)

type VerifyState = "idle" | "verifying" | "verified" | "failed" | "unsupported"

const TIME_CLAIMS = ["exp", "iat", "nbf"] as const

const base64UrlToBytes = (input: string): Uint8Array => {
    const replaced = input.replace(/-/g, "+").replace(/_/g, "/")
    const padding = replaced.length % 4
    const padded = padding ? replaced + "=".repeat(4 - padding) : replaced
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

// Verify an HS256 JWT signature using Web Crypto.
const verifyHs256 = async (token: string, secret: string): Promise<boolean> => {
    const parts = token.split(".")
    if (parts.length !== 3) return false
    const [headerB64, payloadB64, signatureB64] = parts
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    )
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const signature = base64UrlToBytes(signatureB64)
    return crypto.subtle.verify("HMAC", key, signature.buffer as ArrayBuffer, data)
}

const formatTimestamp = (seconds: number): string => {
    const date = new Date(seconds * 1000)
    if (Number.isNaN(date.getTime())) return String(seconds)
    return date.toLocaleString()
}

export function JwtDebugger() {
    const t = useTranslations('JwtDebugger')

    const [token, setToken] = useState("")
    const [secret, setSecret] = useState("")
    const [header, setHeader] = useState<any>(null)
    const [payload, setPayload] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDecoded, setIsDecoded] = useState(false)
    const [verifyState, setVerifyState] = useState<VerifyState>("idle")

    // Decode header + payload (no signature claim).
    useEffect(() => {
        if (!token.trim()) {
            setHeader(null)
            setPayload(null)
            setError(null)
            setIsDecoded(false)
            return
        }

        try {
            const decodedHeader = jwtDecode(token, { header: true })
            const decodedPayload = jwtDecode(token)
            setHeader(decodedHeader)
            setPayload(decodedPayload)
            setIsDecoded(true)
            setError(null)
        } catch {
            setIsDecoded(false)
            setError(t("invalidToken"))
            setHeader(null)
            setPayload(null)
        }
    }, [token, t])

    const alg: string | undefined = header?.alg

    // Real signature verification when a secret is provided.
    useEffect(() => {
        if (!isDecoded || !secret) {
            setVerifyState("idle")
            return
        }
        if (alg !== "HS256") {
            setVerifyState("unsupported")
            return
        }

        let cancelled = false
        setVerifyState("verifying")
        verifyHs256(token, secret)
            .then((ok) => {
                if (!cancelled) setVerifyState(ok ? "verified" : "failed")
            })
            .catch(() => {
                if (!cancelled) setVerifyState("failed")
            })
        return () => {
            cancelled = true
        }
    }, [token, secret, alg, isDecoded])

    // Expiration status derived from the exp claim.
    const expiryStatus = useMemo(() => {
        const exp = payload?.exp
        if (typeof exp !== "number") return null
        const isExpired = exp * 1000 < Date.now()
        return { isExpired, date: formatTimestamp(exp) }
    }, [payload])

    const timeClaims = useMemo(() => {
        if (!payload) return []
        return TIME_CLAIMS.filter((c) => typeof payload[c] === "number").map((c) => ({
            claim: c,
            label: t(`claim.${c}`),
            value: formatTimestamp(payload[c]),
        }))
    }, [payload, t])

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] min-h-[600px] grid lg:grid-cols-2 gap-6 pb-12">
            {/* Input Section */}
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Key className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{t("encodedToken")}</h2>
                </div>

                <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative group">
                    <Textarea
                        placeholder={t("inputPlaceholder")}
                        className="flex-1 w-full h-full resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus-visible:ring-0 field-sizing-content"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    {!token && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                            <p className="text-sm text-muted-foreground">{t("pastePrompt")}</p>
                        </div>
                    )}
                </GlassCard>

                <div className="space-y-2 px-1">
                    <Label htmlFor="jwt-secret" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("secretLabel")}
                    </Label>
                    <Input
                        id="jwt-secret"
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder={t("secretPlaceholder")}
                        className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">{t("secretHelp")}</p>
                </div>

                {error && token && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">{error}</span>
                    </div>
                )}
            </div>

            {/* Output Section */}
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <FileJson className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{t("decoded")}</h2>
                    {isDecoded && (
                        <SignatureBadge state={verifyState} t={t} />
                    )}
                </div>

                <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("header")}</span>
                            </div>
                            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                                {header ? (
                                    <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                        {formatJson(header)}
                                    </pre>
                                ) : (
                                    <span className="text-muted-foreground text-sm italic opacity-50">{t("waiting")}</span>
                                )}
                            </div>
                        </div>

                        {/* Payload Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("payload")}</span>
                            </div>
                            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                                {payload ? (
                                    <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                                        {formatJson(payload)}
                                    </pre>
                                ) : (
                                    <span className="text-muted-foreground text-sm italic opacity-50">{t("waiting")}</span>
                                )}
                            </div>
                        </div>

                        {/* Claims (human-readable timestamps) */}
                        {timeClaims.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t("claims")}</span>
                                </div>
                                <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 space-y-2">
                                    {timeClaims.map((c) => (
                                        <div key={c.claim} className="flex justify-between gap-4 text-xs">
                                            <span className="font-mono text-muted-foreground">{c.label}</span>
                                            <span className="font-medium text-right">{c.value}</span>
                                        </div>
                                    ))}
                                    {expiryStatus && (
                                        <div
                                            className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                                                expiryStatus.isExpired ? "text-destructive" : "text-green-600 dark:text-green-400"
                                            }`}
                                        >
                                            {expiryStatus.isExpired ? (
                                                <XCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            )}
                                            {expiryStatus.isExpired ? t("expired") : t("notExpired")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Signature Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t("signature")}</span>
                            </div>
                            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 text-xs leading-relaxed">
                                {!secret ? (
                                    <span className="text-muted-foreground">{t("signatureHint")}</span>
                                ) : verifyState === "unsupported" ? (
                                    <span className="text-amber-600 dark:text-amber-400">
                                        {t("signatureUnsupported", { alg: alg ?? "?" })}
                                    </span>
                                ) : verifyState === "verifying" ? (
                                    <span className="text-muted-foreground">{t("verifying")}</span>
                                ) : verifyState === "verified" ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">{t("signatureVerified")}</span>
                                ) : verifyState === "failed" ? (
                                    <span className="text-destructive font-medium">{t("signatureFailed")}</span>
                                ) : (
                                    <span className="text-muted-foreground">{t("signatureHint")}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

function SignatureBadge({ state, t }: { state: VerifyState; t: (k: string) => string }) {
    const base = "ml-auto px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"

    if (state === "verified") {
        return (
            <div className={`${base} bg-green-500/10 text-green-500`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("badgeVerified")}
            </div>
        )
    }
    if (state === "failed") {
        return (
            <div className={`${base} bg-destructive/10 text-destructive`}>
                <XCircle className="w-3.5 h-3.5" />
                {t("badgeFailed")}
            </div>
        )
    }
    if (state === "unsupported") {
        return (
            <div className={`${base} bg-amber-500/10 text-amber-500`}>
                <HelpCircle className="w-3.5 h-3.5" />
                {t("badgeUnsupported")}
            </div>
        )
    }
    if (state === "verifying") {
        return (
            <div className={`${base} bg-muted text-muted-foreground`}>
                <HelpCircle className="w-3.5 h-3.5" />
                {t("verifying")}
            </div>
        )
    }
    // idle: decoded but no secret provided -> honest "not verified"
    return (
        <div className={`${base} bg-muted text-muted-foreground`}>
            <HelpCircle className="w-3.5 h-3.5" />
            {t("badgeNotVerified")}
        </div>
    )
}
