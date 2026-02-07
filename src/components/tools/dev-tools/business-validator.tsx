"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Building2, UserCircle, RefreshCw, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function BusinessValidator() {
    const t = useTranslations("DevTools.BusinessValidator")

    // Business Number State
    const [bizNum, setBizNum] = useState("")
    const [bizResult, setBizResult] = useState<{ isValid: boolean, message: string } | null>(null)
    const [isBizCopied, setIsBizCopied] = useState(false)

    // Resident Number State
    const [resNum, setResNum] = useState("")
    const [resResult, setResResult] = useState<{ isValid: boolean, message: string } | null>(null)
    const [isResCopied, setIsResCopied] = useState(false)

    // Korean Business Number Validation Logic
    const validateBizNum = (val: string) => {
        const number = val.replace(/-/g, "")
        if (number.length !== 10) {
            setBizResult({ isValid: false, message: t("errorLength") })
            return false
        }

        const key = [1, 3, 7, 1, 3, 7, 1, 3, 5]
        let sum = 0

        for (let i = 0; i < 9; i++) {
            sum += parseInt(number[i]) * key[i]
        }

        sum += Math.floor((parseInt(number[8]) * 5) / 10)

        const last = parseInt(number[9])
        const check = (10 - (sum % 10)) % 10

        const isValid = last === check
        setBizResult({
            isValid,
            message: isValid ? t("validBiz") : t("invalidBiz")
        })
        return isValid
    }

    const generateRandomBizNumber = () => {
        // Generate first 9 digits randomly
        // aaa-bb-cccc (mostly b and c are used for categorization but for random test numbers any valid check digit works)
        const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))

        const key = [1, 3, 7, 1, 3, 7, 1, 3, 5]
        let sum = 0
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * key[i]
        }
        sum += Math.floor((digits[8] * 5) / 10)

        const checkDigit = (10 - (sum % 10)) % 10
        digits.push(checkDigit)

        const formatted = `${digits.slice(0, 3).join("")}-${digits.slice(3, 5).join("")}-${digits.slice(5, 10).join("")}`
        setBizNum(formatted)
        validateBizNum(formatted)
    }

    const copyToClipboard = (text: string, type: 'biz' | 'res') => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(t("copied"))
        if (type === 'biz') {
            setIsBizCopied(true)
            setTimeout(() => setIsBizCopied(false), 2000)
        } else {
            setIsResCopied(true)
            setTimeout(() => setIsResCopied(false), 2000)
        }
    }

    // Resident Number Validation Logic
    const validateResNum = (val: string) => {
        const number = val.replace(/-/g, "")
        if (number.length !== 13) {
            setResResult({ isValid: false, message: t("errorResLength") })
            return
        }

        const front = number.substring(0, 6)
        const back = number.substring(6, 13)

        const month = parseInt(front.substring(2, 4))
        const day = parseInt(front.substring(4, 6))

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            setResResult({ isValid: false, message: t("invalidDate") })
            return
        }

        const gender = parseInt(back[0])
        if (gender < 1 || gender > 8) {
            setResResult({ isValid: false, message: t("invalidGender") })
            return
        }

        let sum = 0
        const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
        for (let i = 0; i < 12; i++) {
            sum += parseInt(number[i]) * weights[i]
        }
        const check = (11 - (sum % 11)) % 10

        if (check !== parseInt(number[12])) {
            setResResult({ isValid: false, message: t("invalidResChecksum") })
            return
        }

        setResResult({ isValid: true, message: t("validRes") })
    }

    return (
        <Tabs defaultValue="biz" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="biz" className="rounded-md">
                    <Building2 className="w-4 h-4 mr-2" />
                    {t("tabs.biz")}
                </TabsTrigger>
                <TabsTrigger value="res" className="rounded-md">
                    <UserCircle className="w-4 h-4 mr-2" />
                    {t("tabs.res")}
                </TabsTrigger>
            </TabsList>

            <div className="min-h-[450px]">
                <TabsContent value="biz" className="mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
                        {/* Input Area */}
                        <div className="space-y-6 flex flex-col justify-center">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-foreground/70 ml-1 uppercase tracking-tight">{t("bizInputLabel")}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={bizNum}
                                        onChange={(e) => {
                                            setBizNum(e.target.value)
                                            if (e.target.value === "") setBizResult(null)
                                        }}
                                        placeholder="123-45-67890"
                                        className="text-2xl font-mono tracking-[0.2em] h-16 bg-background/50 border-primary/20 focus:border-primary transition-all text-center px-4"
                                        maxLength={12}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Button className="flex-1 h-12 text-lg font-bold shadow-md hover:scale-[1.02] transition-transform active:scale-95" onClick={() => validateBizNum(bizNum)}>
                                    {t("check")}
                                </Button>
                                <Button variant="outline" className="flex-1 h-12 gap-2 border-primary/20 hover:bg-primary/5 hover:scale-[1.02] transition-transform active:scale-95" onClick={generateRandomBizNumber}>
                                    <RefreshCw className="h-4 w-4" />
                                    {t("generate")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border border-primary/10 hover:bg-primary/5 hover:scale-[1.02] transition-transform active:scale-95"
                                    onClick={() => copyToClipboard(bizNum, 'biz')}
                                    disabled={!bizNum}
                                >
                                    {isBizCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>

                        {/* Result Area */}
                        <div className="flex flex-col justify-center items-center border-2 border-dashed border-primary/10 rounded-2xl bg-muted/20 p-8 min-h-[450px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            {bizResult ? (
                                <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500 relative z-10">
                                    <div className={cn(
                                        "mx-auto h-24 w-24 rounded-full flex items-center justify-center shadow-2xl",
                                        bizResult.isValid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {bizResult.isValid ? <CheckCircle2 className="h-16 w-16" /> : <XCircle className="h-16 w-16" />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className={cn(
                                            "text-4xl font-black tracking-tighter uppercase",
                                            bizResult.isValid ? "text-green-500" : "text-red-500"
                                        )}>
                                            {bizResult.isValid ? "VALID" : "INVALID"}
                                        </p>
                                        <p className="text-xl text-muted-foreground font-medium max-w-xs mx-auto">
                                            {bizResult.message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground/40 space-y-4 relative z-10 transition-all group-hover:text-muted-foreground/60">
                                    <Building2 className="h-24 w-24 mx-auto opacity-20 transform transition-transform group-hover:scale-110 duration-500" />
                                    <p className="text-lg font-medium tracking-tight uppercase">{t("tabs.biz")} {t("check")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="res" className="mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
                        {/* Input Area */}
                        <div className="space-y-6 flex flex-col justify-center">
                            <div className="bg-yellow-500/5 text-yellow-600/80 p-5 rounded-2xl text-sm border border-yellow-500/10 leading-relaxed shadow-sm">
                                <span className="font-bold mr-1">⚠️</span> {t("resWarning")}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-foreground/70 ml-1 uppercase tracking-tight">{t("resInputLabel")}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={resNum}
                                        onChange={(e) => {
                                            setResNum(e.target.value)
                                            if (e.target.value === "") setResResult(null)
                                        }}
                                        placeholder="YYMMDD-1234567"
                                        className="text-2xl font-mono tracking-[0.2em] h-16 bg-background/50 border-primary/20 focus:border-primary transition-all text-center px-4"
                                        maxLength={14}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Button className="flex-1 h-12 text-lg font-bold shadow-md hover:scale-[1.02] transition-transform active:scale-95" onClick={() => validateResNum(resNum)}>
                                    {t("check")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 border border-primary/10 hover:bg-primary/5 hover:scale-[1.02] transition-transform active:scale-95"
                                    onClick={() => copyToClipboard(resNum, 'res')}
                                    disabled={!resNum}
                                >
                                    {isResCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>

                        {/* Result Area */}
                        <div className="flex flex-col justify-center items-center border-2 border-dashed border-primary/10 rounded-2xl bg-muted/20 p-8 min-h-[450px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            {resResult ? (
                                <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500 relative z-10">
                                    <div className={cn(
                                        "mx-auto h-24 w-24 rounded-full flex items-center justify-center shadow-2xl",
                                        resResult.isValid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {resResult.isValid ? <CheckCircle2 className="h-16 w-16" /> : <XCircle className="h-16 w-16" />}
                                    </div>
                                    <div className="space-y-2">
                                        <p className={cn(
                                            "text-4xl font-black tracking-tighter uppercase",
                                            resResult.isValid ? "text-green-500" : "text-red-500"
                                        )}>
                                            {resResult.isValid ? "VALID" : "INVALID"}
                                        </p>
                                        <p className="text-xl text-muted-foreground font-medium max-w-xs mx-auto">
                                            {resResult.message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground/40 space-y-4 relative z-10 transition-all group-hover:text-muted-foreground/60">
                                    <UserCircle className="h-24 w-24 mx-auto opacity-20 transform transition-transform group-hover:scale-110 duration-500" />
                                    <p className="text-lg font-medium tracking-tight uppercase">{t("tabs.res")} {t("check")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}
