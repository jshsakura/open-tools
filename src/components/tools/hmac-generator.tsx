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
import CryptoJS from "crypto-js"

export function HmacGenerator() {
    const t = useTranslations("HmacGenerator")
    const [input, setInput] = useState("")
    const [secret, setSecret] = useState("")
    const [algorithm, setAlgorithm] = useState("SHA256")
    const [output, setOutput] = useState("")
    const [copied, setCopied] = useState(false)

    const generateHmac = () => {
        if (!input || !secret) {
            toast.error(t("errorEmpty"))
            return
        }

        let result: CryptoJS.lib.WordArray

        switch (algorithm) {
            case "MD5":
                result = CryptoJS.HmacMD5(input, secret)
                break
            case "SHA1":
                result = CryptoJS.HmacSHA1(input, secret)
                break
            case "SHA256":
                result = CryptoJS.HmacSHA256(input, secret)
                break
            case "SHA512":
                result = CryptoJS.HmacSHA512(input, secret)
                break
            default:
                result = CryptoJS.HmacSHA256(input, secret)
        }

        setOutput(result.toString(CryptoJS.enc.Hex))
        toast.success(t("successGenerated"))
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileKey className="h-5 w-5 text-amber-500" />
                    {t("title")}
                </CardTitle>
                <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="algorithm">{t("algoLabel")}</Label>
                        <Select value={algorithm} onValueChange={setAlgorithm}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MD5">HMAC-MD5</SelectItem>
                                <SelectItem value="SHA1">HMAC-SHA1</SelectItem>
                                <SelectItem value="SHA256">HMAC-SHA256</SelectItem>
                                <SelectItem value="SHA512">HMAC-SHA512</SelectItem>
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
                        <Label>{t("outputLabel")}</Label>
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
