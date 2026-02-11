"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"



const SqlFormatter = dynamic(
    () => import('@/components/tools/sql-formatter').then(mod => ({ default: mod.SqlFormatter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function SqlFormatterPage() {
    const t = useTranslations('Catalog')
    const tool = getToolById('sql-formatter');

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                {tool && (
                    <ToolPageHeader
                        title={t('SqlFormatter.title')}
                        description={t('SqlFormatter.description')}
                        icon={tool.icon}
                        colorClass={tool.color}
                    />
                )}
            </div>
            <SqlFormatter />
        </div>
    )
}
