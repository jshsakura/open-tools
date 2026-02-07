"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Database } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const SqlConverter = dynamic(
    () => import('@/components/tools/sql-converter').then(mod => ({ default: mod.SqlConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function SqlConverterPage() {
    const t = useTranslations('Catalog.SqlConverter')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <SqlConverter />
        </div>
    )
}
