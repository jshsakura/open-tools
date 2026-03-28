"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Shield, RefreshCw, Copy, Check, Lock, KeyRound } from "lucide-react"
import { toast } from "sonner"
import bcrypt from "bcryptjs"

export function BcryptGenerator() {
    const t = useTranslations("BcryptGenerator")
    const [password, setPassword] = useState("")
    const [rounds, setRounds] = useState(10)
    const [hash, setHash] = useState("")
    const [checkPassword, setCheckPassword] = useState("")
    const [checkHash, setCheckHash] = useState("")
    const [isMatch, setIsMatch] = useState<boolean | null>(null)
    const [copied, setCopied] = useState(false)

    const generateHash = () => {
        if (!password) {
            toast.error(t("errorEmpty"))
            return
        }
        try {
            const salt = bcrypt.genSaltSync(rounds)
            const newHash = bcrypt.hashSync(password, salt)
            setHash(newHash)
            toast.success(t("successGenerated"))
        } catch (e) {
            console.error(e)
            toast.error(t("error"))
        }
    }

    const verifyHash = () => {
        if (!checkPassword || !checkHash) {
            toast.error(t("errorVerifyEmpty"))
            return
        }
        try {
            const match = bcrypt.compareSync(checkPassword, checkHash)
            setIsMatch(match)
            if (match) toast.success(t("matchSuccess"))
            else toast.error(t("matchFail"))
        } catch (e) {
            console.error(e)
            setIsMatch(false)
            toast.error(t("errorVerify"))
        }
    }

    const copyToClipboard = () => {
        if (!hash) return
        navigator.clipboard.writeText(hash)
        setCopied(true)
        toast.success(t("copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-500" />
                        {t("generateTitle")}
                    </CardTitle>
                    <CardDescription>{t("generateDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">{t("passwordLabel")}</Label>
                        <Input
                            id="password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("passwordPlaceholder")}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>{t("roundsLabel")}: {rounds}</Label>
                            <span className="text-xs text-muted-foreground">{t("roundsDesc")}</span>
                        </div>
                        <Slider
                            value={[rounds]}
                            min={4}
                            max={16} // 16 is already very slow in JS
                            step={1}
                            onValueChange={(val) => setRounds(val[0])}
                        />
                    </div>

                    <Button onClick={generateHash} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("generateButton")}
                    </Button>

                    {hash && (
                        <div className="relative mt-4 p-4 bg-muted rounded-md break-all font-mono text-sm">
                            {hash}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue-500" />
                        {t("verifyTitle")}
                    </CardTitle>
                    <CardDescription>{t("verifyDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="check-password">{t("passwordLabel")}</Label>
                            <Input
                                id="check-password"
                                type="text"
                                value={checkPassword}
                                onChange={(e) => setCheckPassword(e.target.value)}
                                placeholder={t("passwordPlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="check-hash">{t("hashLabel")}</Label>
                            <Input
                                id="check-hash"
                                type="text"
                                value={checkHash}
                                onChange={(e) => setCheckHash(e.target.value)}
                                placeholder={t("hashPlaceholder")}
                            />
                        </div>
                    </div>

                    <Button onClick={verifyHash} variant="secondary" className="w-full">
                        <Shield className="mr-2 h-4 w-4" />
                        {t("verifyButton")}
                    </Button>

                    {isMatch !== null && (
                        <div className={`p-4 rounded-md flex items-center gap-2 font-medium ${isMatch ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                            {isMatch ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />} // Oops imported X?
                            {isMatch ? t("matchSuccess") : t("matchFail")}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 18 18" />
        </svg>
    )
}
