"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    Link,
    ArrowRightLeft,
    Copy,
    Trash2,
    AlertCircle,
    ArrowDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function UrlConverter() {
    const t = useTranslations('UrlConverter')
    const [encodeInput, setEncodeInput] = useState("")
    const [decodeInput, setDecodeInput] = useState("")
    const [decodeError, setDecodeError] = useState<string | null>(null)

    // Encode Logic
    const encodedOutput = encodeInput ? encodeURIComponent(encodeInput) : ""

    // Decode Logic
    let decodedOutput = ""
    try {
        if (decodeInput) {
            decodedOutput = decodeURIComponent(decodeInput)
            if (decodeError) setDecodeError(null)
        }
    } catch (e) {
        if (!decodeError && decodeInput.trim()) {
            setDecodeError("Invalid URL encoded string")
        }
    }

    const copyToClipboard = (text: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(t('copied'))
    }

    const clearEncode = () => setEncodeInput("")
    const clearDecode = () => {
        setDecodeInput("")
        setDecodeError(null)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>

            <GlassCard className="p-1 rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
                <Tabs defaultValue="encode" className="w-full flex-1 flex flex-col">
                    <div className="p-4 border-b border-border/10 bg-secondary/30 backdrop-blur-md">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-background/50 p-1 rounded-xl">
                            <TabsTrigger value="encode" className="rounded-lg gap-2">
                                <Link className="w-4 h-4" />
                                {t('tabs.encode')}
                            </TabsTrigger>
                            <TabsTrigger value="decode" className="rounded-lg gap-2">
                                <ArrowRightLeft className="w-4 h-4" />
                                {t('tabs.decode')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 flex-1">
                        {/* ENCODE TAB */}
                        <TabsContent value="encode" className="space-y-6 mt-0 h-full flex flex-col">
                            <div className="flex-1 grid gap-4">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('input')}</Label>
                                        <Button variant="ghost" size="sm" onClick={clearEncode} disabled={!encodeInput} className="h-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            {t('clear')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder={t('encodePlaceholder')}
                                        value={encodeInput}
                                        onChange={(e) => setEncodeInput(e.target.value)}
                                        className="flex-1 min-h-[150px] font-mono resize-none bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>

                                <div className="flex justify-center -my-2 z-10">
                                    <div className="bg-secondary rounded-full p-2 border border-border">
                                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('output')}</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(encodedOutput)}
                                            disabled={!encodedOutput}
                                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            <Copy className="w-4 h-4 mr-1" />
                                            {t('copy')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        readOnly
                                        value={encodedOutput}
                                        className="flex-1 min-h-[150px] font-mono resize-none bg-muted/30 text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* DECODE TAB */}
                        <TabsContent value="decode" className="space-y-6 mt-0 h-full flex flex-col">
                            <div className="flex-1 grid gap-4">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('input')}</Label>
                                        <Button variant="ghost" size="sm" onClick={clearDecode} disabled={!decodeInput} className="h-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            {t('clear')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder={t('decodePlaceholder')}
                                        value={decodeInput}
                                        onChange={(e) => {
                                            setDecodeInput(e.target.value)
                                            setDecodeError(null)
                                        }}
                                        className={cn(
                                            "flex-1 min-h-[150px] font-mono resize-none bg-background/50 focus:bg-background transition-colors",
                                            decodeError && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                    {decodeError && (
                                        <div className="text-destructive text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {decodeError}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center -my-2 z-10">
                                    <div className="bg-secondary rounded-full p-2 border border-border">
                                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <Label>{t('output')}</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(decodedOutput)}
                                            disabled={!decodedOutput}
                                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            <Copy className="w-4 h-4 mr-1" />
                                            {t('copy')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        readOnly
                                        value={decodedOutput}
                                        className="flex-1 min-h-[150px] font-mono resize-none bg-muted/30 text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </GlassCard>
        </div>
    )
}
