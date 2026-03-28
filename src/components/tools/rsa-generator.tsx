"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Key, RefreshCw, Copy, Check, Lock, Unlock } from "lucide-react"
import { toast } from "sonner"
import forge from "node-forge"

export function RsaGenerator() {
    const t = useTranslations("RsaGenerator")
    const [keySize, setKeySize] = useState("2048")
    const [privateKey, setPrivateKey] = useState("")
    const [publicKey, setPublicKey] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [copiedPrivate, setCopiedPrivate] = useState(false)
    const [copiedPublic, setCopiedPublic] = useState(false)

    const generateKeys = async () => {
        setIsGenerating(true)
        // Wra in timeout to allow UI to update
        setTimeout(() => {
            try {
                const rsa = forge.pki.rsa
                const keypair = rsa.generateKeyPair({ bits: parseInt(keySize), workers: 2 })

                const privatePem = forge.pki.privateKeyToPem(keypair.privateKey)
                const publicPem = forge.pki.publicKeyToPem(keypair.publicKey)

                setPrivateKey(privatePem)
                setPublicKey(publicPem)
                toast.success(t("successGenerated"))
            } catch (e) {
                console.error(e)
                toast.error(t("error"))
            } finally {
                setIsGenerating(false)
            }
        }, 100)
    }

    const copyToClipboard = (text: string, isPrivate: boolean) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        if (isPrivate) {
            setCopiedPrivate(true)
            setTimeout(() => setCopiedPrivate(false), 2000)
        } else {
            setCopiedPublic(true)
            setTimeout(() => setCopiedPublic(false), 2000)
        }
        toast.success(t("copied"))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-500" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-end gap-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="keySize">{t("keySizeLabel")}</Label>
                            <Select value={keySize} onValueChange={setKeySize}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1024">1024 bit (Fast, Less Secure)</SelectItem>
                                    <SelectItem value="2048">2048 bit (Standard)</SelectItem>
                                    <SelectItem value="4096">4096 bit (Slow, More Secure)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={generateKeys} disabled={isGenerating} className="mb-0.5">
                            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                            {isGenerating ? t("generating") : t("generateButton")}
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Unlock className="h-4 w-4 text-green-500" />
                                    {t("publicKeyLabel")}
                                </Label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(publicKey, false)}
                                    disabled={!publicKey}
                                >
                                    {copiedPublic ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                                    {copiedPublic ? t("copied") : t("copy")}
                                </Button>
                            </div>
                            <Textarea
                                value={publicKey}
                                readOnly
                                className="font-mono text-xs h-[300px] resize-none bg-muted"
                                placeholder={t("publicKeyPlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-red-500" />
                                    {t("privateKeyLabel")}
                                </Label>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(privateKey, true)}
                                    disabled={!privateKey}
                                >
                                    {copiedPrivate ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                                    {copiedPrivate ? t("copied") : t("copy")}
                                </Button>
                            </div>
                            <Textarea
                                value={privateKey}
                                readOnly
                                className="font-mono text-xs h-[300px] resize-none bg-muted"
                                placeholder={t("privateKeyPlaceholder")}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
