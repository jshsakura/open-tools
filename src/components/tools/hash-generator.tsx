"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
    Hash,
    Copy,
    Trash2,
    CheckCircle2,
    RefreshCw,
    Fingerprint
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { md5 } from "@/lib/md5"

export function HashGenerator() {
    const t = useTranslations('HashGenerator')
    const [input, setInput] = useState("")
    const [hashes, setHashes] = useState({
        md5: "",
        sha1: "",
        sha256: "",
        sha512: ""
    })
    const [isCalculating, setIsCalculating] = useState(false)

    useEffect(() => {
        if (!input) {
            setHashes({ md5: "", sha1: "", sha256: "", sha512: "" })
            return
        }

        const calculateHashes = async () => {
            setIsCalculating(true)
            try {
                const encoder = new TextEncoder()
                const data = encoder.encode(input)

                // MD5 (Custom Implementation)
                const md5Hash = md5(input)

                // SHA Family (Web Crypto API)
                const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
                const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
                const sha512Buffer = await crypto.subtle.digest('SHA-512', data)

                setHashes({
                    md5: md5Hash,
                    sha1: bufferToHex(sha1Buffer),
                    sha256: bufferToHex(sha256Buffer),
                    sha512: bufferToHex(sha512Buffer)
                })
            } catch (error) {
                console.error("Hashing failed:", error)
                toast.error(t('error'))
            } finally {
                setIsCalculating(false)
            }
        }

        // Debounce slightly to avoid heavy calculation on every keystroke
        const timer = setTimeout(calculateHashes, 100)
        return () => clearTimeout(timer)
    }, [input, t])

    const bufferToHex = (buffer: ArrayBuffer) => {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    }

    const copyToClipboard = (text: string, algorithm: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(t('copied', { algorithm }))
    }

    const clear = () => setInput("")

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard className="p-6 rounded-2xl overflow-hidden min-h-[500px] flex flex-col gap-6">

                {/* Input Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-primary" />
                            {t('input')}
                        </Label>
                        <Button variant="ghost" size="sm" onClick={clear} disabled={!input} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t('clear')}
                        </Button>
                    </div>
                    <Textarea
                        placeholder={t('placeholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-[120px] font-mono whitespace-pre-wrap bg-background/50 focus:bg-background transition-all resize-y"
                    />
                </div>

                {/* Hashes Grid */}
                <div className="grid gap-6">
                    <HashRow
                        label="MD5"
                        value={hashes.md5}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.md5, "MD5")}
                    />
                    <HashRow
                        label="SHA-1"
                        value={hashes.sha1}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha1, "SHA-1")}
                    />
                    <HashRow
                        label="SHA-256"
                        value={hashes.sha256}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha256, "SHA-256")}
                    />
                    <HashRow
                        label="SHA-512"
                        value={hashes.sha512}
                        loading={isCalculating}
                        onCopy={() => copyToClipboard(hashes.sha512, "SHA-512")}
                        textArea
                    />
                </div>
            </GlassCard>
        </div>
    )
}

function HashRow({ label, value, loading, onCopy, textArea = false }: {
    label: string,
    value: string,
    loading: boolean,
    onCopy: () => void,
    textArea?: boolean
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
            <div className="relative group">
                {textArea ? (
                    <Textarea
                        readOnly
                        value={value}
                        className="font-mono text-xs bg-muted/30 text-foreground/90 min-h-[80px] pr-10 resize-none"
                    />
                ) : (
                    <Input
                        readOnly
                        value={value}
                        className="font-mono text-xs bg-muted/30 text-foreground/90 h-10 pr-10"
                    />
                )}

                <div className="absolute top-0 right-0 p-1 h-full flex items-start pt-[6px] pr-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onCopy}
                        disabled={!value || loading}
                    >
                        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
