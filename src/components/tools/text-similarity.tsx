"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Check, Copy, RefreshCw, Scale } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export function TextSimilarity() {
    const t = useTranslations('TextSimilarity');
    const [text1, setText1] = useState("")
    const [text2, setText2] = useState("")
    const [similarity, setSimilarity] = useState(0)

    const calculateSimilarity = (s1: string, s2: string) => {
        if (!s1 && !s2) return 100
        if (!s1 || !s2) return 0
        if (s1 === s2) return 100

        const longer = s1.length > s2.length ? s1 : s2
        const shorter = s1.length > s2.length ? s2 : s1
        const longerLength = longer.length
        
        const editDistance = levenshtein(s1, s2)
        return ((longerLength - editDistance) / longerLength) * 100
    }

    const levenshtein = (a: string, b: string) => {
        const matrix = []

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i]
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                }
            }
        }

        return matrix[b.length][a.length]
    }

    useEffect(() => {
        setSimilarity(calculateSimilarity(text1, text2))
    }, [text1, text2])

    const clearAll = () => {
        setText1("")
        setText2("")
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <GlassCard className="p-8">
                <div className="flex flex-col items-center justify-center mb-10 space-y-4">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-muted/20"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={552.92}
                                strokeDashoffset={552.92 * (1 - similarity / 100)}
                                className="text-primary transition-all duration-500 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-primary">{similarity.toFixed(1)}%</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">{t('score')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">{t('text1')}</Label>
                            <span className="text-xs text-muted-foreground">{text1.length} chars</span>
                        </div>
                        <Textarea
                            placeholder="Paste original text here..."
                            className="min-h-[300px] bg-muted/20 focus:bg-background transition-colors resize-none leading-relaxed"
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">{t('text2')}</Label>
                            <span className="text-xs text-muted-foreground">{text2.length} chars</span>
                        </div>
                        <Textarea
                            placeholder="Paste text to compare here..."
                            className="min-h-[300px] bg-muted/20 focus:bg-background transition-colors resize-none leading-relaxed"
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-8 gap-4">
                    <Button variant="outline" onClick={clearAll}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('calculate')}
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}
