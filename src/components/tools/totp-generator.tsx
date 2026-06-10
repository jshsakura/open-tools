"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Copy,
    CheckCircle2,
    Fingerprint,
    Info,
    KeyRound,
    Lock,
    Settings,
    ShieldAlert,
} from "lucide-react"

// Helper to decode Base32 to Uint8Array
function decodeBase32(secret: string): Uint8Array {
    const cleaned = secret.replace(/[\s-=]+/g, "").toUpperCase()
    if (!cleaned) return new Uint8Array(0)
    
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    if (!/^[A-Z2-7]*$/.test(cleaned)) {
        throw new Error("Invalid characters")
    }

    let bits = 0
    let val = 0
    const bytes: number[] = []

    for (let i = 0; i < cleaned.length; i++) {
        val = (val << 5) | alphabet.indexOf(cleaned[i])
        bits += 5
        if (bits >= 8) {
            bytes.push((val >> (bits - 8)) & 255)
            bits -= 8
        }
    }
    return new Uint8Array(bytes)
}

// Helper to parse otpauth:// URI
interface ParsedOtpAuth {
    label: string
    secret: string
    issuer?: string
    algorithm?: string
    digits?: number
    period?: number
}

function parseOtpAuthUrl(urlStr: string): ParsedOtpAuth | null {
    try {
        const cleaned = urlStr.trim()
        if (!cleaned.startsWith("otpauth://")) return null

        const url = new URL(cleaned)
        if (url.protocol !== "otpauth:" || url.hostname !== "totp") return null

        const path = decodeURIComponent(url.pathname.replace(/^\//, ""))
        const secret = url.searchParams.get("secret")
        if (!secret) return null

        const issuer = url.searchParams.get("issuer") || undefined
        const algorithm = url.searchParams.get("algorithm")?.toUpperCase() || undefined
        
        const digitsStr = url.searchParams.get("digits")
        const digits = digitsStr ? parseInt(digitsStr, 10) : undefined

        const periodStr = url.searchParams.get("period")
        const period = periodStr ? parseInt(periodStr, 10) : undefined

        return {
            label: path,
            secret,
            issuer,
            algorithm,
            digits,
            period,
        }
    } catch {
        return null
    }
}

export function TotpGenerator() {
    const t = useTranslations("TotpGenerator")
    
    // Config states
    const [rawInput, setRawInput] = useState("")
    const [secret, setSecret] = useState("")
    const [algo, setAlgo] = useState("SHA-1")
    const [digits, setDigits] = useState(6)
    const [period, setPeriod] = useState(30)
    
    // parsed info metadata
    const [issuer, setIssuer] = useState("")
    const [account, setAccount] = useState("")

    // Status states
    const [otpCode, setOtpCode] = useState("------")
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30)
    const [mounted, setMounted] = useState(false)

    // Handle input change (raw secret or otpauth link)
    const handleInputChange = (val: string) => {
        setRawInput(val)
        setError(null)

        const parsed = parseOtpAuthUrl(val)
        if (parsed) {
            setSecret(parsed.secret)
            if (parsed.algorithm) {
                // Map SHA1 to SHA-1, SHA256 to SHA-256, etc.
                const mappedAlgo = parsed.algorithm.replace("SHA", "SHA-")
                if (["SHA-1", "SHA-256", "SHA-512"].includes(mappedAlgo)) {
                    setAlgo(mappedAlgo)
                }
            }
            if (parsed.digits) setDigits(parsed.digits)
            if (parsed.period) setPeriod(parsed.period)

            // Extract account and issuer info
            if (parsed.issuer) {
                setIssuer(parsed.issuer)
                setAccount(parsed.label.includes(":") ? parsed.label.split(":")[1].trim() : parsed.label)
            } else if (parsed.label.includes(":")) {
                const parts = parsed.label.split(":")
                setIssuer(parts[0].trim())
                setAccount(parts[1].trim())
            } else {
                setIssuer("")
                setAccount(parsed.label)
            }
        } else {
            // treat as raw secret
            setSecret(val)
            setIssuer("")
            setAccount("")
        }
    }

    // Dynamic TOTP generator using crypto.subtle
    const calculateTotp = async () => {
        if (!secret) {
            setOtpCode("------")
            setError(null)
            return
        }

        try {
            const secretBytes = decodeBase32(secret)
            if (secretBytes.length === 0) {
                setOtpCode("------")
                return
            }

            setError(null)
            const epochSeconds = Math.floor(Date.now() / 1000)
            const counter = Math.floor(epochSeconds / period)

            // Calculate exact seconds left in period
            const currentSecondsLeft = period - (epochSeconds % period)
            setTimeLeft(currentSecondsLeft)

            // Import HMAC Key
            const cryptoKey = await window.crypto.subtle.importKey(
                "raw",
                secretBytes as any,
                {
                    name: "HMAC",
                    hash: { name: algo },
                },
                false,
                ["sign"]
            )

            // Create 8-byte big-endian buffer for counter
            const counterBuffer = new ArrayBuffer(8)
            const view = new DataView(counterBuffer)
            const high = Math.floor(counter / 0x100000000)
            const low = counter % 0x100000000
            view.setUint32(0, high)
            view.setUint32(4, low)

            // Sign
            const signature = await window.crypto.subtle.sign(
                "HMAC",
                cryptoKey,
                counterBuffer
            )

            // Truncate signature
            const hash = new Uint8Array(signature)
            const offset = hash[hash.length - 1] & 0xf
            const binary =
                ((hash[offset] & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8) |
                (hash[offset + 3] & 0xff)

            const otp = binary % Math.pow(10, digits)
            const otpStr = otp.toString().padStart(digits, "0")
            setOtpCode(otpStr)
        } catch (err: any) {
            setOtpCode("------")
            setError(t("invalidSecret"))
        }
    }

    // Effect for mounting
    useEffect(() => {
        setMounted(true)
    }, [])

    // Timer effect
    useEffect(() => {
        if (!mounted) return

        calculateTotp()

        const interval = setInterval(() => {
            calculateTotp()
        }, 1000)

        return () => clearInterval(interval)
    }, [mounted, secret, algo, digits, period])

    // Copy to clipboard
    const handleCopy = () => {
        if (otpCode === "------") return
        navigator.clipboard.writeText(otpCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Circular Progress calculation
    const radius = 32
    const circumference = 2 * Math.PI * radius
    const progressOffset = circumference - (timeLeft / period) * circumference

    if (!mounted) {
        return <div className="py-12 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Configuration Panel */}
                <Card className="md:col-span-2 border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Fingerprint className="h-5 w-5 text-primary" />
                            {t("title")}
                        </CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Secret Key or URL input */}
                        <div className="space-y-2">
                            <Label htmlFor="secretInput" className="font-semibold text-sm">
                                {t("secretKey")}
                            </Label>
                            <Input
                                id="secretInput"
                                value={rawInput}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder={t("secretKeyPlaceholder")}
                                className="font-mono text-sm tracking-wide bg-background/50"
                            />
                            <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                Paste either a raw secret key (Base32 format) or an OTPAuth URL (e.g. otpauth://totp/...).
                            </p>
                        </div>

                        {/* Error alert */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Settings accordion or grid */}
                        <div className="pt-2 border-t border-border/10">
                            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Settings className="h-3.5 w-3.5" />
                                Advanced Configuration
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Hashing Algorithm */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-semibold">
                                        {t("algorithm")}
                                    </Label>
                                    <Select value={algo} onValueChange={setAlgo}>
                                        <SelectTrigger className="h-9 text-xs bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SHA-1">SHA-1 (Default)</SelectItem>
                                            <SelectItem value="SHA-256">SHA-256</SelectItem>
                                            <SelectItem value="SHA-512">SHA-512</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Digits */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-semibold">
                                        {t("digits")}
                                    </Label>
                                    <Select value={String(digits)} onValueChange={(val) => setDigits(parseInt(val, 10))}>
                                        <SelectTrigger className="h-9 text-xs bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="6">6 digits</SelectItem>
                                            <SelectItem value="8">8 digits</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Period */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-semibold">
                                        {t("period")}
                                    </Label>
                                    <Select value={String(period)} onValueChange={(val) => setPeriod(parseInt(val, 10))}>
                                        <SelectTrigger className="h-9 text-xs bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 seconds</SelectItem>
                                            <SelectItem value="60">60 seconds</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Display issuer and account if parsed */}
                        {(issuer || account) && (
                            <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wide text-primary/80">
                                    {t("details")}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">{t("issuer")}</span>
                                        <span className="font-bold">{issuer || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">{t("account")}</span>
                                        <span className="font-medium font-mono">{account || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Verification Code Display */}
                <Card className="border-primary/10 shadow-lg bg-gradient-to-b from-card/80 to-card flex flex-col justify-between overflow-hidden">
                    <CardHeader className="bg-primary/5 py-4 border-b border-primary/5">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5 justify-center text-primary">
                            <Lock className="h-4 w-4" />
                            {t("currentCode")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
                        {/* OTP display */}
                        <button
                            onClick={handleCopy}
                            disabled={otpCode === "------"}
                            className="w-full text-center group cursor-pointer focus:outline-none animate-pulse-subtle"
                            title="Click to copy"
                        >
                            <div className="font-mono text-4xl font-extrabold tracking-widest text-primary tabular-nums group-hover:scale-105 transition-transform duration-200">
                                {otpCode}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-semibold mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                Click code to copy
                            </div>
                        </button>

                        {/* Circular progress and countdown */}
                        <div className="relative flex items-center justify-center">
                            <svg className="w-20 h-20 transform -rotate-90">
                                {/* Background Circle */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    className="stroke-muted"
                                    strokeWidth="4"
                                    fill="transparent"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    className="stroke-primary transition-all duration-1000 ease-linear"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progressOffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-sm font-extrabold font-mono text-muted-foreground tabular-nums">
                                {timeLeft}s
                            </span>
                        </div>

                        {/* Action buttons */}
                        <Button
                            onClick={handleCopy}
                            disabled={otpCode === "------"}
                            className="w-full h-10 gap-2 font-bold rounded-xl"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? t("copied") : t("copyCode")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
