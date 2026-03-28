"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
    Lock, Unlock, Copy, CheckCircle2, ShieldCheck, KeyRound,
    Eye, EyeOff, Trash2, ArrowRight, Zap, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encryptAES, decryptAES } from "@/lib/aes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AesCrypto() {
    const t = useTranslations('AesCrypto')
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground max-w-3xl leading-relaxed">{t('description')}</p>
            </header>

            {/* Algorithm Info Bar */}
            <GlassCard className="p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    {[
                        { icon: ShieldCheck, label: t('infoAlgorithm'), value: "AES-256-GCM" },
                        { icon: KeyRound, label: t('infoKeyDerivation'), value: "PBKDF2 (100K)" },
                        { icon: Zap, label: t('infoProcessing'), value: t('infoLocal') },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2 rounded-lg border border-border/30 px-3 py-2">
                            <Icon className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-mono font-bold text-foreground">{value}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Mode Switcher */}
            <div className="flex gap-2">
                <button
                    onClick={() => setMode('encrypt')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300",
                        mode === 'encrypt'
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted/80 border border-border/30"
                    )}
                >
                    <Lock className="w-5 h-5" />
                    {t('encryptTab')}
                </button>
                <button
                    onClick={() => setMode('decrypt')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300",
                        mode === 'decrypt'
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted/80 border border-border/30"
                    )}
                >
                    <Unlock className="w-5 h-5" />
                    {t('decryptTab')}
                </button>
            </div>

            {/* Encrypt Mode */}
            {mode === 'encrypt' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Input Panel */}
                        <GlassCard className="p-0 overflow-hidden">
                            <div className="border-b border-border/10 bg-muted/30 p-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-emerald-500" />
                                    {t('inputText')}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={clearEncrypt} className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1">
                                    <Trash2 className="w-3 h-3" /> {t('clear')}
                                </Button>
                            </div>
                            <div className="p-5 space-y-5">
                                <Textarea
                                    value={eInput}
                                    onChange={e => setEInput(e.target.value)}
                                    placeholder={t('inputPlaceholder')}
                                    className="min-h-[220px] resize-none font-mono text-sm border-0 bg-muted/20 focus-visible:ring-1"
                                />

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold flex items-center gap-1">
                                        <KeyRound className="w-3 h-3" /> {t('password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showEPassword ? "text" : "password"}
                                            value={ePassword}
                                            onChange={e => setEPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            className="pr-10 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEPassword(!showEPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showEPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Password strength */}
                                    {ePassword && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 flex-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= passwordStrength(ePassword).level ? passwordStrength(ePassword).color : "bg-border/40")} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground">{passwordStrength(ePassword).label}</span>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-bold gap-2 shadow-lg shadow-primary/20"
                                    onClick={handleEncrypt}
                                    disabled={!eInput || !ePassword || isEncrypting}
                                >
                                    {isEncrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {t('encryptButton')}
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Output Panel */}
                        <GlassCard className="p-0 overflow-hidden border-primary/20">
                            <div className="border-b border-border/10 bg-muted/30 p-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-primary" />
                                    {t('outputCipher')}
                                </h3>
                                {eOutput && (
                                    <span className="text-[10px] font-mono text-muted-foreground">{eOutput.length} chars</span>
                                )}
                            </div>
                            <div className="p-5 space-y-5">
                                <div className="relative">
                                    <Textarea
                                        value={eOutput}
                                        readOnly
                                        placeholder={t('outputPlaceholder')}
                                        className="min-h-[220px] resize-none font-mono text-sm border-0 bg-muted/10 focus-visible:ring-0"
                                    />
                                    {eOutput && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-3 right-3 gap-1 text-xs"
                                            onClick={() => copyToClipboard(eOutput, 'encrypt')}
                                        >
                                            {copiedField === 'encrypt' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            {copiedField === 'encrypt' ? t('copied') : t('copyBtn')}
                                        </Button>
                                    )}
                                </div>

                                {/* Security Note */}
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-sm flex gap-3">
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{t('securityTitle')}</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">{t('securityNote')}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Decrypt Mode */}
            {mode === 'decrypt' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Input Panel */}
                        <GlassCard className="p-0 overflow-hidden">
                            <div className="border-b border-border/10 bg-muted/30 p-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Unlock className="w-4 h-4 text-violet-500" />
                                    {t('inputCipher')}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={clearDecrypt} className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1">
                                    <Trash2 className="w-3 h-3" /> {t('clear')}
                                </Button>
                            </div>
                            <div className="p-5 space-y-5">
                                <Textarea
                                    value={dInput}
                                    onChange={e => setDInput(e.target.value)}
                                    placeholder={t('cipherPlaceholder')}
                                    className="min-h-[220px] resize-none font-mono text-sm border-0 bg-muted/20 focus-visible:ring-1"
                                />

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold flex items-center gap-1">
                                        <KeyRound className="w-3 h-3" /> {t('password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showDPassword ? "text" : "password"}
                                            value={dPassword}
                                            onChange={e => setDPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            className="pr-10 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDPassword(!showDPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showDPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-base font-bold gap-2"
                                    variant="outline"
                                    onClick={handleDecrypt}
                                    disabled={!dInput || !dPassword || isDecrypting}
                                >
                                    {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                    {t('decryptButton')}
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Output Panel */}
                        <GlassCard className="p-0 overflow-hidden border-primary/20">
                            <div className="border-b border-border/10 bg-muted/30 p-4 flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-primary" />
                                    {t('outputText')}
                                </h3>
                            </div>
                            <div className="p-5 space-y-5">
                                <div className="relative">
                                    <Textarea
                                        value={dOutput}
                                        readOnly
                                        placeholder={t('decryptedPlaceholder')}
                                        className="min-h-[220px] resize-none font-mono text-sm border-0 bg-muted/10 focus-visible:ring-0"
                                    />
                                    {dOutput && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-3 right-3 gap-1 text-xs"
                                            onClick={() => copyToClipboard(dOutput, 'decrypt')}
                                        >
                                            {copiedField === 'decrypt' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            {copiedField === 'decrypt' ? t('copied') : t('copyBtn')}
                                        </Button>
                                    )}
                                </div>

                                {dOutput && (
                                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/15 text-sm flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-violet-500" />
                                        <p className="text-muted-foreground text-xs leading-relaxed">{t('decryptNote')}</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

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
