"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Regex } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const RegexTester = dynamic(
    () => import('@/components/tools/regex-tester').then(mod => ({ default: mod.RegexTester })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function RegexTesterPage() {
    const t = useTranslations('RegexTester')

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 text-center space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-500 mb-4 ring-1 ring-rose-500/20 shadow-lg shadow-rose-500/10">
                    <Regex className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    {t('title')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('description')}
                </p>
            </div>

            <RegexTester />
        </div>
    )
}
