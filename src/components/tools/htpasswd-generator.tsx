"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { GlassCard } from "@/components/ui/glass-card"
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
import { KeyRound, RefreshCw, Copy, Check, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import bcrypt from "bcryptjs"
import {
    apr1,
    sha1Htpasswd,
    formatLine,
    generateSalt,
} from "./htpasswd-generator.utils"

type Algorithm = "bcrypt" | "apr1" | "sha1"

const BCRYPT_ROUNDS = 10

export function HtpasswdGenerator() {
    const t = useTranslations("HtpasswdGenerator")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [algorithm, setAlgorithm] = useState<Algorithm>("bcrypt")
    const [lines, setLines] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [copiedAll, setCopiedAll] = useState(false)

    const buildHash = async (pw: string, algo: Algorithm): Promise<string> => {
        if (algo === "sha1") {
            return sha1Htpasswd(pw)
        }
        if (algo === "apr1") {
            return apr1(pw, generateSalt())
        }
        // bcrypt — Apache expects the $2y$ prefix; bcryptjs emits $2a$/$2b$.
        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
        const hash = await bcrypt.hash(pw, salt)
        return hash.replace(/^\$2[ab]\$/, "$2y$")
    }

    const handleGenerate = async () => {
        if (!username.trim()) {
            toast.error(t("errorNoUser"))
            return
        }
        if (!password) {
            toast.error(t("errorNoPassword"))
            return
        }
        setIsGenerating(true)
        try {
            const hash = await buildHash(password, algorithm)
            const line = formatLine(username.trim(), hash)
            // Replace any existing entry for the same username (immutable).
            const user = username.trim()
            const next = [
                ...lines.filter((l) => l.split(":")[0] !== user),
                line,
            ]
            setLines(next)
            setPassword("")
            toast.success(t("successGenerated"))
        } catch (e) {
            console.error(e)
            toast.error(t("error"))
        } finally {
            setIsGenerating(false)
        }
    }

    const removeLine = (index: number) => {
        setLines((prev) => prev.filter((_, i) => i !== index))
    }

    const clearAll = () => {
        setLines([])
        toast.success(t("cleared"))
    }

    const copyLine = (line: string, index: number) => {
        navigator.clipboard.writeText(line)
        setCopiedIndex(index)
        toast.success(t("copied"))
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const copyAll = () => {
        if (lines.length === 0) return
        navigator.clipboard.writeText(lines.join("\n"))
        setCopiedAll(true)
        toast.success(t("copiedAll"))
        setTimeout(() => setCopiedAll(false), 2000)
    }

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 space-y-5">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-emerald-500" />
                    <h2 className="text-lg font-semibold">{t("title")}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{t("description")}</p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="htpasswd-user">{t("usernameLabel")}</Label>
                        <Input
                            id="htpasswd-user"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t("usernamePlaceholder")}
                            autoComplete="off"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="htpasswd-pass">{t("passwordLabel")}</Label>
                        <Input
                            id="htpasswd-pass"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("passwordPlaceholder")}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t("algorithmLabel")}</Label>
                    <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bcrypt">{t("algoBcrypt")}</SelectItem>
                            <SelectItem value="apr1">{t("algoApr1")}</SelectItem>
                            <SelectItem value="sha1">{t("algoSha1")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t(`hint_${algorithm}`)}</p>
                </div>

                <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? t("generating") : t("generateButton")}
                </Button>
            </GlassCard>

            {lines.length > 0 && (
                <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold">
                            {t("resultTitle")} ({lines.length})
                        </h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={copyAll}>
                                {copiedAll ? (
                                    <Check className="mr-1.5 h-4 w-4" />
                                ) : (
                                    <Copy className="mr-1.5 h-4 w-4" />
                                )}
                                {t("copyAll")}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={clearAll}>
                                <RefreshCw className="mr-1.5 h-4 w-4" />
                                {t("clearAll")}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {lines.map((line, i) => (
                            <div
                                key={line}
                                className="relative flex items-center gap-2 rounded-md bg-muted p-3 pr-20 font-mono text-xs break-all"
                            >
                                <span className="flex-1">{line}</span>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => copyLine(line, i)}
                                        aria-label={t("copy")}
                                    >
                                        {copiedIndex === i ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => removeLine(i)}
                                        aria-label={t("remove")}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
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
