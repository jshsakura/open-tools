"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Ruler } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const UnitConverter = dynamic(
    () => import('@/components/tools/unit-converter').then(mod => ({ default: mod.UnitConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function UnitConverterPage() {
    const t = useTranslations('UnitConverter')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl drop-shadow-sm">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>
            <UnitConverter />
        </div>
    )
}
