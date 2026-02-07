"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Lock, Unlock, Copy, RotateCcw, ArrowRight, ShieldCheck, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encryptAES, decryptAES } from "@/lib/aes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AesCrypto() {
    const t = useTranslations('AesCrypto')
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

    // Encrypt State
    const [eInput, setEInput] = useState("")
    const [ePassword, setEPassword] = useState("")
    const [eOutput, setEOutput] = useState("")

    // Decrypt State
    const [dInput, setDInput] = useState("")
    const [dPassword, setDPassword] = useState("")
    const [dOutput, setDOutput] = useState("")

    const handleEncrypt = async () => {
        if (!eInput || !ePassword) return
        try {
            const result = await encryptAES(eInput, ePassword)
            setEOutput(result)
        } catch (e) {
            alert(t('encryptError'))
        }
    }

    const handleDecrypt = async () => {
        if (!dInput || !dPassword) return
        try {
            const result = await decryptAES(dInput, dPassword)
            setDOutput(result)
        } catch (e) {
            alert(t('decryptError'))
        }
    }

    const copyToClipboard = (text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        alert(t('copied'))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard className="p-6">
                <Tabs defaultValue="encrypt" onValueChange={(v) => setMode(v as any)} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/50 p-1">
                        <TabsTrigger value="encrypt" className="rounded-lg text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                            <Lock className="w-4 h-4 mr-2" />
                            {t('encryptTab')}
                        </TabsTrigger>
                        <TabsTrigger value="decrypt" className="rounded-lg text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                            <Unlock className="w-4 h-4 mr-2" />
                            {t('decryptTab')}
                        </TabsTrigger>
                    </TabsList>

                    {/* ENCRYPT TAB */}
                    <TabsContent value="encrypt" className="space-y-6 mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label>{t('inputText')}</Label>
                                <Textarea
                                    value={eInput}
                                    onChange={(e) => setEInput(e.target.value)}
                                    placeholder={t('inputPlaceholder')}
                                    className="min-h-[200px] resize-none font-mono text-sm"
                                />
                                <div className="space-y-2">
                                    <Label>{t('password')}</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={ePassword}
                                            onChange={(e) => setEPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 text-base font-semibold"
                                    onClick={handleEncrypt}
                                    disabled={!eInput || !ePassword}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    {t('encryptButton')}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <Label>{t('outputCipher')}</Label>
                                <div className="relative">
                                    <Textarea
                                        value={eOutput}
                                        readOnly
                                        placeholder={t('outputPlaceholder')}
                                        className="min-h-[200px] resize-none font-mono text-sm bg-muted/30"
                                    />
                                    {eOutput && (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => copyToClipboard(eOutput)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{t('securityNote')}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* DECRYPT TAB */}
                    <TabsContent value="decrypt" className="space-y-6 mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label>{t('inputCipher')}</Label>
                                <Textarea
                                    value={dInput}
                                    onChange={(e) => setDInput(e.target.value)}
                                    placeholder={t('cipherPlaceholder')}
                                    className="min-h-[200px] resize-none font-mono text-sm"
                                />
                                <div className="space-y-2">
                                    <Label>{t('password')}</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            value={dPassword}
                                            onChange={(e) => setDPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 text-base font-semibold"
                                    variant="outline"
                                    onClick={handleDecrypt}
                                    disabled={!dInput || !dPassword}
                                >
                                    <Unlock className="w-4 h-4 mr-2" />
                                    {t('decryptButton')}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <Label>{t('outputText')}</Label>
                                <div className="relative">
                                    <Textarea
                                        value={dOutput}
                                        readOnly
                                        placeholder={t('decryptedPlaceholder')}
                                        className="min-h-[200px] resize-none font-mono text-sm bg-muted/30"
                                    />
                                    {dOutput && (
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => copyToClipboard(dOutput)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </GlassCard>
        </div>
    )
}
