"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Lock, Unlock, Copy, CheckCircle2, ShieldCheck, KeyRound,
    Eye, EyeOff, Trash2, ArrowDown, Zap, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { encryptAES, decryptAES } from "@/lib/aes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AesCrypto() {
    const t = useTranslations('AesCrypto')

    // Encrypt
    const [eInput, setEInput] = useState("")
    const [ePassword, setEPassword] = useState("")
    const [eOutput, setEOutput] = useState("")
    const [isEncrypting, setIsEncrypting] = useState(false)

    // Decrypt
    const [dInput, setDInput] = useState("")
    const [dPassword, setDPassword] = useState("")
    const [dOutput, setDOutput] = useState("")
    const [isDecrypting, setIsDecrypting] = useState(false)

    // UI
    const [showEPassword, setShowEPassword] = useState(false)
    const [showDPassword, setShowDPassword] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copyToClipboard = useCallback((text: string, field: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success(t('copied'))
        setTimeout(() => setCopiedField(null), 2000)
    }, [t])

    const handleEncrypt = async () => {
        if (!eInput || !ePassword) return
        setIsEncrypting(true)
        try {
            const result = await encryptAES(eInput, ePassword)
            setEOutput(result)
            toast.success(t('encryptSuccess'))
        } catch {
            toast.error(t('encryptError'))
        } finally {
            setIsEncrypting(false)
        }
    }

    const handleDecrypt = async () => {
        if (!dInput || !dPassword) return
        setIsDecrypting(true)
        try {
            const result = await decryptAES(dInput, dPassword)
            setDOutput(result)
            toast.success(t('decryptSuccess'))
        } catch {
            toast.error(t('decryptError'))
        } finally {
            setIsDecrypting(false)
        }
    }

    const clearEncrypt = () => { setEInput(""); setEPassword(""); setEOutput("") }
    const clearDecrypt = () => { setDInput(""); setDPassword(""); setDOutput("") }

    const passwordStrength = (pw: string): { level: number; label: string; color: string } => {
        if (!pw) return { level: 0, label: "", color: "" }
        let score = 0
        if (pw.length >= 8) score++
        if (pw.length >= 12) score++
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
        if (/\d/.test(pw)) score++
        if (/[^A-Za-z0-9]/.test(pw)) score++
        if (score <= 1) return { level: 1, label: t('strengthWeak'), color: "bg-red-500" }
        if (score <= 2) return { level: 2, label: t('strengthFair'), color: "bg-orange-500" }
        if (score <= 3) return { level: 3, label: t('strengthGood'), color: "bg-yellow-500" }
        return { level: 4, label: t('strengthStrong'), color: "bg-green-500" }
    }

    const PasswordInput = ({ value, onChange, show, onToggle, placeholder, strength }: {
        value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string; strength?: boolean
    }) => (
        <div className="space-y-2">
            <Label className="text-xs font-bold flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> {t('password')}
            </Label>
            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pr-10 font-mono"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {strength && value && (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= passwordStrength(value).level ? passwordStrength(value).color : "bg-border/40")} />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{passwordStrength(value).label}</span>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            {/* Algorithm Info */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                {[
                    { icon: ShieldCheck, value: "AES-256-GCM" },
                    { icon: KeyRound, value: "PBKDF2 (100K)" },
                    { icon: Zap, value: t('infoLocal') },
                ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-3 py-1.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        <span className="font-mono font-bold">{value}</span>
                    </div>
                ))}
            </div>

            {/* Main Card with Tabs */}
            <GlassCard className="p-1 rounded-2xl overflow-hidden min-h-[520px] flex flex-col">
                <Tabs defaultValue="encrypt" className="w-full flex-1 flex flex-col">
                    <div className="p-4 border-b border-border/10 bg-secondary/30 backdrop-blur-md">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-background/50 rounded-xl">
                            <TabsTrigger value="encrypt" className="rounded-lg gap-2 text-base">
                                <Lock className="w-4 h-4" />
                                {t('encryptTab')}
                            </TabsTrigger>
                            <TabsTrigger value="decrypt" className="rounded-lg gap-2 text-base">
                                <Unlock className="w-4 h-4" />
                                {t('decryptTab')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 flex-1">
                        {/* ENCRYPT TAB */}
                        <TabsContent value="encrypt" className="space-y-0 mt-0 h-full flex flex-col">
                            <div className="flex-1 grid gap-4">
                                {/* Input */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('inputText')}</Label>
                                        <Button variant="ghost" size="sm" onClick={clearEncrypt} disabled={!eInput && !ePassword} className="h-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-1" /> {t('clear')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={eInput}
                                        onChange={e => setEInput(e.target.value)}
                                        placeholder={t('inputPlaceholder')}
                                        className="flex-1 min-h-[140px] font-mono text-sm resize-none bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>

                                {/* Password */}
                                <PasswordInput
                                    value={ePassword} onChange={setEPassword}
                                    show={showEPassword} onToggle={() => setShowEPassword(!showEPassword)}
                                    placeholder={t('passwordPlaceholder')} strength
                                />

                                {/* Encrypt Button */}
                                <Button
                                    className="w-full h-11 font-bold gap-2"
                                    onClick={handleEncrypt}
                                    disabled={!eInput || !ePassword || isEncrypting}
                                >
                                    {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {t('encryptButton')}
                                </Button>

                                {/* Arrow */}
                                <div className="flex justify-center -my-1 z-10">
                                    <div className="bg-secondary rounded-full p-2 border border-border">
                                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Output */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('outputCipher')}</Label>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={() => copyToClipboard(eOutput, 'encrypt')}
                                            disabled={!eOutput}
                                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            {copiedField === 'encrypt' ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                                            {t('copyBtn')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={eOutput}
                                        readOnly
                                        placeholder={t('outputPlaceholder')}
                                        className="flex-1 min-h-[140px] font-mono text-sm resize-none bg-muted/30 text-muted-foreground"
                                    />
                                </div>

                                {/* Security Note */}
                                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs flex gap-2.5">
                                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                                    <p className="text-muted-foreground leading-relaxed">{t('securityNote')}</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* DECRYPT TAB */}
                        <TabsContent value="decrypt" className="space-y-0 mt-0 h-full flex flex-col">
                            <div className="flex-1 grid gap-4">
                                {/* Input */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('inputCipher')}</Label>
                                        <Button variant="ghost" size="sm" onClick={clearDecrypt} disabled={!dInput && !dPassword} className="h-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-1" /> {t('clear')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={dInput}
                                        onChange={e => setDInput(e.target.value)}
                                        placeholder={t('cipherPlaceholder')}
                                        className="flex-1 min-h-[140px] font-mono text-sm resize-none bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>

                                {/* Password */}
                                <PasswordInput
                                    value={dPassword} onChange={setDPassword}
                                    show={showDPassword} onToggle={() => setShowDPassword(!showDPassword)}
                                    placeholder={t('passwordPlaceholder')}
                                />

                                {/* Decrypt Button */}
                                <Button
                                    className="w-full h-11 font-bold gap-2"
                                    variant="outline"
                                    onClick={handleDecrypt}
                                    disabled={!dInput || !dPassword || isDecrypting}
                                >
                                    {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                    {t('decryptButton')}
                                </Button>

                                {/* Arrow */}
                                <div className="flex justify-center -my-1 z-10">
                                    <div className="bg-secondary rounded-full p-2 border border-border">
                                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Output */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('outputText')}</Label>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={() => copyToClipboard(dOutput, 'decrypt')}
                                            disabled={!dOutput}
                                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            {copiedField === 'decrypt' ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                                            {t('copyBtn')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={dOutput}
                                        readOnly
                                        placeholder={t('decryptedPlaceholder')}
                                        className="flex-1 min-h-[140px] font-mono text-sm resize-none bg-muted/30 text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </GlassCard>

            {/* How It Works */}
            <GlassCard className="p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">{t('howItWorks')}</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                    {[
                        { step: "1", icon: KeyRound, title: t('step1Title'), desc: t('step1Desc') },
                        { step: "2", icon: Lock, title: t('step2Title'), desc: t('step2Desc') },
                        { step: "3", icon: ShieldCheck, title: t('step3Title'), desc: t('step3Desc') },
                    ].map(({ step, icon: Icon, title, desc }) => (
                        <div key={step} className="flex gap-3 p-4 rounded-xl bg-muted/20 border border-border/20">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {step}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}
