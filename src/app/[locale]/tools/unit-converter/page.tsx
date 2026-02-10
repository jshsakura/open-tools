"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"







const UnitConverter = dynamic(
    () => import('@/components/tools/unit-converter').then(mod => ({ default: mod.UnitConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function UnitConverterPage() {
    const t = useTranslations('UnitConverter')
    const tool = getToolById('unit-converter')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {tool && (
                <ToolPageHeader
                    title={t('title')}
                    description={t('description')}
                    icon={tool.icon}
                    colorClass={tool.color}
                />
            )}
            <UnitConverter />
        </div>
    )
}
