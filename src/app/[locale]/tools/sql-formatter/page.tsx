"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Database } from "lucide-react"
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const SqlFormatter = dynamic(
    () => import('@/components/tools/sql-formatter').then(mod => ({ default: mod.SqlFormatter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function SqlFormatterPage() {
    const t = useTranslations('Catalog.SqlFormatter')

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen max-w-6xl">
            <div className="mb-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 mb-4 ring-1 ring-emerald-500/20">
                    <Database className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl drop-shadow-sm">
                    {t('title')}
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <SqlFormatter />
        </div>
    )
}
