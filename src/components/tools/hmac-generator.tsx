"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Copy, Check, FileKey } from "lucide-react"
import { toast } from "sonner"
import {
    decodeKey,
    bufToHex,
    bufToBase64,
    type KeyEncoding,
    type OutputEncoding,
} from "./hmac-generator.utils"

// Web Crypto HMAC supports SHA-1/256/384/512 only (no MD5, no SHA-3).
const HASH_ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const

export function HmacGenerator() {
    const t = useTranslations("HmacGenerator")
    const [input, setInput] = useState("")
    const [secret, setSecret] = useState("")
    const [algorithm, setAlgorithm] = useState<string>("SHA-256")
    const [keyEncoding, setKeyEncoding] = useState<KeyEncoding>("utf8")
    const [outputEncoding, setOutputEncoding] = useState<OutputEncoding>("hex")
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    const generateHmac = async () => {
        if (!input || !secret) {
            toast.error(t("errorEmpty"))
            return
        }

        let keyBytes: Uint8Array
        try {
            keyBytes = decodeKey(secret, keyEncoding)
        } catch {
            toast.error(t("errorKeyDecode"))
            return
        }

        if (keyBytes.length === 0) {
            toast.error(t("errorEmpty"))
            return
        }

        try {
            // Copy into a fresh ArrayBuffer-backed view so the type is a plain
            // BufferSource (not ArrayBufferLike) for importKey.
            const keyData = new Uint8Array(keyBytes.length)
            keyData.set(keyBytes)
            const cryptoKey = await crypto.subtle.importKey(
                "raw",
                keyData,
                { name: "HMAC", hash: algorithm },
                false,
                ["sign"]
            )
            const messageBytes = new TextEncoder().encode(input)
            const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBytes)

            setOutput(outputEncoding === "hex" ? bufToHex(signature) : bufToBase64(signature))
            toast.success(t("successGenerated"))
        } catch (error) {
            console.error("HMAC generation failed:", error)
            toast.error(t("error"))
        }
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="mx-auto max-w-5xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileKey className="h-5 w-5 text-amber-500" />
                    {t("title")}
                </CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="algorithm">{t("algoLabel")}</Label>
                        <Select value={algorithm} onValueChange={setAlgorithm}>
                            <SelectTrigger id="algorithm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {HASH_ALGORITHMS.map((algo) => (
                                    <SelectItem key={algo} value={algo}>
                                        HMAC-{algo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keyEncoding">{t("keyEncodingLabel")}</Label>
                        <Select
                            value={keyEncoding}
                            onValueChange={(v) => setKeyEncoding(v as KeyEncoding)}
                        >
                            <SelectTrigger id="keyEncoding">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utf8">UTF-8</SelectItem>
                                <SelectItem value="hex">Hex</SelectItem>
                                <SelectItem value="base64">Base64</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="outputEncoding">{t("outputEncodingLabel")}</Label>
                        <Select
                            value={outputEncoding}
                            onValueChange={(v) => setOutputEncoding(v as OutputEncoding)}
                        >
                            <SelectTrigger id="outputEncoding">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hex">Hex</SelectItem>
                                <SelectItem value="base64">Base64</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="secret">{t("secretLabel")}</Label>
                    <Input
                        id="secret"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder={t("secretPlaceholder")}
                        type="password"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="input">{t("inputLabel")}</Label>
                    <Textarea
                        id="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("inputPlaceholder")}
                        rows={5}
                        className="font-mono"
                    />
                </div>

                <Button onClick={generateHmac} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("generateButton")}
                </Button>

                {output && (
                    <div className="space-y-2">
                        <Label>
                            {t("outputResultLabel")} ({outputEncoding === "hex" ? "Hex" : "Base64"})
                        </Label>
                        <div className="relative p-4 bg-muted rounded-md break-all font-mono text-sm">
                            {output}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
