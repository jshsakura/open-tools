"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check, Copy, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import slugify from "slugify"

export function SlugGenerator() {
    const t = useTranslations("DataTools")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [lower, setLower] = useState(true)
    const [strict, setStrict] = useState(true)
    const [trim, setTrim] = useState(true)
    const [copied, setCopied] = useState(false)

    const generateSlug = () => {
        if (!input) {
            toast.error(t("SlugGenerator.errorEmpty"))
            return
        }

        const slug = slugify(input, {
            lower,
            strict,
            trim
        })
        setOutput(slug)
    }

    const copyToClipboard = () => {
        if (!output) return
        navigator.clipboard.writeText(output)
        setCopied(true)
        toast.success(t("SlugGenerator.copied"))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <div className="space-y-4">
                <Label>{t("SlugGenerator.inputLabel")}</Label>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("SlugGenerator.inputPlaceholder")}
                    className="h-12 text-lg"
                />
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <Switch checked={lower} onCheckedChange={setLower} id="lower" />
                    <Label htmlFor="lower">{t("SlugGenerator.lowercase")}</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={strict} onCheckedChange={setStrict} id="strict" />
                    <Label htmlFor="strict">{t("SlugGenerator.strict")}</Label>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={trim} onCheckedChange={setTrim} id="trim" />
                    <Label htmlFor="trim">{t("SlugGenerator.trim")}</Label>
                </div>
            </div>

            <Button onClick={generateSlug} className="w-full h-12 text-lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                {t("SlugGenerator.generateButton")}
            </Button>

            {output && (
                <div className="space-y-2">
                    <Label>{t("SlugGenerator.outputLabel")}</Label>
                    <div className="relative">
                        <Input value={output} readOnly className="h-12 text-lg bg-muted text-primary font-mono" />
                        <Button
                            className="absolute right-1 top-1 h-10 w-10 p-0"
                            variant="ghost"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
