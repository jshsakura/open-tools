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
    const tool = getToolById('sql-formatter');

    return (
        <div className="mb-12 space-y-4">
            {tool && (
                <ToolPageHeader
                    title={t('title')}
                    description={t('description')}
                    icon={tool.icon}
                    colorClass={tool.color}
                />
            )}
        </div>

            <SqlFormatter />
        </div>
    )
}
