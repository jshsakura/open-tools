"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from 'next-intl'
import { Check, Copy, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    computeSimilarityMetrics,
    MAX_SIMILARITY_INPUT_LENGTH,
} from "./text-similarity.utils"

export function TextSimilarity() {
    const t = useTranslations('TextSimilarity');
    const [text1, setText1] = useState("")
    const [text2, setText2] = useState("")
    const [copied, setCopied] = useState(false)

    const isTooLong =
        text1.length > MAX_SIMILARITY_INPUT_LENGTH ||
        text2.length > MAX_SIMILARITY_INPUT_LENGTH

    const metrics = useMemo(() => {
        if (isTooLong) return { levenshtein: 0, jaccard: 0, dice: 0 }
        return computeSimilarityMetrics(text1, text2)
    }, [text1, text2, isTooLong])

    // The headline score is the Levenshtein-based ratio shown in the dial.
    const similarity = metrics.levenshtein

    useEffect(() => {
        if (isTooLong) {
            toast.warning(t('tooLong', { max: MAX_SIMILARITY_INPUT_LENGTH }))
        }
    }, [isTooLong, t])

    const clearAll = () => {
        setText1("")
        setText2("")
    }

    const handleCopy = async () => {
        const summary = [
            `${t('metricLevenshtein')}: ${metrics.levenshtein.toFixed(1)}%`,
            `${t('metricJaccard')}: ${metrics.jaccard.toFixed(1)}%`,
            `${t('metricDice')}: ${metrics.dice.toFixed(1)}%`,
        ].join("\n")
        await navigator.clipboard.writeText(summary)
        setCopied(true)
        toast.success(t('copiedResults'))
        setTimeout(() => setCopied(false), 2000)
    }

    const metricCards = [
        { label: t('metricLevenshtein'), value: metrics.levenshtein },
        { label: t('metricJaccard'), value: metrics.jaccard },
        { label: t('metricDice'), value: metrics.dice },
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <GlassCard className="p-8">
                <div className="flex flex-col items-center justify-center mb-10 space-y-6">
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

                    <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                        {metricCards.map((metric) => (
                            <div
                                key={metric.label}
                                className="rounded-xl bg-muted/20 border border-border/50 p-4 text-center"
                            >
                                <div className="text-2xl font-bold text-primary">
                                    {metric.value.toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {metric.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">{t('text1')}</Label>
                            <span className="text-xs text-muted-foreground">{text1.length} chars</span>
                        </div>
                        <Textarea
                            placeholder={t('placeholder1')}
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
                            placeholder={t('placeholder2')}
                            className="min-h-[300px] bg-muted/20 focus:bg-background transition-colors resize-none leading-relaxed"
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                        />
                    </div>
                </div>

                {isTooLong && (
                    <p className="text-center text-sm text-amber-600 mt-6">
                        {t('tooLong', { max: MAX_SIMILARITY_INPUT_LENGTH })}
                    </p>
                )}

                <div className="flex justify-center mt-8 gap-4">
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        disabled={!text1 && !text2}
                    >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? t('copiedResults') : t('copyResults')}
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('clear')}
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}
