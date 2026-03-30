"use client"

import { useState, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Copy, CheckCircle2, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

function calculateStrength(password: string): number {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (password.length >= 20) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    // Penalize repetitive patterns
    if (/(.)\1{2,}/.test(password)) score--
    return Math.max(0, Math.min(4, score <= 2 ? 1 : score <= 4 ? 2 : score <= 6 ? 3 : 4))
}

function generatePassword(
    length: number,
    options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): string {
    let charset = ""
    if (options.uppercase) charset += CHAR_SETS.uppercase
    if (options.lowercase) charset += CHAR_SETS.lowercase
    if (options.numbers) charset += CHAR_SETS.numbers
    if (options.symbols) charset += CHAR_SETS.symbols
    if (!charset) charset = CHAR_SETS.lowercase

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, (val) => charset[val % charset.length]).join("")
}

export function PasswordGenerator() {
    const t = useTranslations("PasswordGenerator")
    const [length, setLength] = useState(16)
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    })
    const [password, setPassword] = useState("")
    const [history, setHistory] = useState<string[]>([])
    const [copied, setCopied] = useState(false)
    const [showPassword, setShowPassword] = useState(true)

    const generate = useCallback(() => {
        const newPassword = generatePassword(length, options)
        setPassword(newPassword)
        setHistory((prev) => [newPassword, ...prev].slice(0, 5))
    }, [length, options])

    useEffect(() => {
        generate()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const copyToClipboard = useCallback(
        async (text: string) => {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success(t("copied"))
            setTimeout(() => setCopied(false), 1500)
        },
        [t]
    )

    const strength = calculateStrength(password)
    const strengthLabels = [t("weak"), t("fair"), t("strong"), t("veryStrong")]
    const strengthColors = [
        "bg-red-500",
        "bg-yellow-500",
        "bg-blue-500",
        "bg-green-500",
    ]

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <GlassCard className="p-6">
                <div className="space-y-5">
                    {/* Password display */}
                    <div className="space-y-2">
                        <Label>{t("generatedPassword")}</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <code className="flex-1 text-lg font-mono break-all select-all">
                                {showPassword ? password : "\u2022".repeat(Math.min(password.length, 32))}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(password)}
                            >
                                {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Strength meter */}
                    {password && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t("strength")}</span>
                                <span className="font-medium">
                                    {strengthLabels[strength - 1] || strengthLabels[0]}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            "h-1.5 flex-1 rounded-full transition-colors",
                                            level <= strength
                                                ? strengthColors[strength - 1]
                                                : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Length slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>{t("length")}</Label>
                            <span className="text-sm font-mono text-muted-foreground">{length}</span>
                        </div>
                        <Slider
                            min={8}
                            max={128}
                            step={1}
                            value={[length]}
                            onValueChange={(val) => setLength(val[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>8</span>
                            <span>128</span>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <Label>{t("options")}</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={options[key]}
                                        onCheckedChange={(checked) =>
                                            setOptions((prev) => ({ ...prev, [key]: !!checked }))
                                        }
                                    />
                                    <span className="text-sm">{t(key)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    <Button onClick={generate} className="w-full gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {t("generate")}
                    </Button>
                </div>
            </GlassCard>

            {/* History */}
            {history.length > 1 && (
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Label>{t("history")}</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistory([])}
                            className="gap-1 text-xs"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t("clearHistory")}
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {history.slice(1).map((pw, index) => (
                            <div
                                key={`${pw}-${index}`}
                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                            >
                                <code className="flex-1 text-xs font-mono break-all text-muted-foreground">
                                    {pw}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(pw)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    )
}
