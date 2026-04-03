"use client"

import { Info, ChevronDown } from "lucide-react"
import { useMessages, useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"

interface ToolGuideSectionProps {
    guide: {
        title: string
        step1: string
        step2: string
        step3: string
    }
    features?: {
        title: string
        items: Array<{
            title: string
            desc: string
            icon?: React.ReactNode
        }>
    }
    faq?: {
        title: string
        items: Array<{
            q: string
            a: string
        }>
    }
}

export function ToolGuideSection({ guide, features, faq }: ToolGuideSectionProps) {
    return (
        <div className="mt-12 mx-auto max-w-5xl space-y-6">
            {/* Guide Section */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-lg shadow-primary/5">
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Info className="w-5 h-5" />
                        {guide.title}
                    </h3>
                    <ul className="space-y-4">
                        {[guide.step1, guide.step2, guide.step3].map((step, i) => (
                            <li key={step} className="flex gap-3 items-start">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Features Section */}
            {features && features.items.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            {features.title}
                        </h3>
                        <div className={`grid gap-4 ${features.items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : features.items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                            {features.items.map((item) => (
                                <div key={item.title} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                                    {item.icon && <div className="mb-2">{item.icon}</div>}
                                    <h4 className="font-semibold mb-1">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* FAQ Section */}
            {faq && faq.items.length > 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                            {faq.title}
                        </h3>
                        <div className="space-y-4">
                            {faq.items.map((item) => (
                                <details key={item.q} className="group rounded-lg bg-secondary/30 border border-border/30 overflow-hidden">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                                        <span className="font-medium pr-4">{item.q}</span>
                                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-4 pt-3 pb-4 text-sm text-muted-foreground">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

/**
 * Convenience wrapper that reads guide/features/faq from a translation namespace.
 * Usage: <ToolGuide ns="SqlFormatter" />
 * Reads from the tool's translation namespace: guide.title, guide.step1, guide.step2, guide.step3
 */
interface ToolGuideProps {
    ns: string
}

export function ToolGuide({ ns }: ToolGuideProps) {
    const t = useTranslations(ns)
    const messages = useMessages()

    const getMessage = (path: string[]): string | undefined => {
        let current: unknown = messages

        for (const segment of [ns, ...path]) {
            if (!current || typeof current !== 'object' || !(segment in current)) {
                return undefined
            }

            current = (current as Record<string, unknown>)[segment]
        }

        return typeof current === 'string' ? current : undefined
    }

    const guide = {
        title: t('guide.title'),
        step1: t('guide.step1'),
        step2: t('guide.step2'),
        step3: t('guide.step3'),
    }

    // Auto-detect features (feature1..featureN)
    let features: ToolGuideSectionProps['features'] | undefined
    const featTitle = getMessage(['features', 'title'])
    if (featTitle) {
        const items: Array<{ title: string; desc: string }> = []
        const keys = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']

        for (const key of keys) {
            const title = getMessage(['features', key, 'title'])
            const desc = getMessage(['features', key, 'desc'])

            if (!title || !desc) {
                break
            }

            items.push({ title, desc })
        }

        if (items.length > 0) {
            features = { title: featTitle, items }
        }
    }

    return <ToolGuideSection guide={guide} features={features} />
}
