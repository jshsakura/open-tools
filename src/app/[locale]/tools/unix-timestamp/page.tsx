"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"

const ToolComponent = dynamic(
    () => import('@/components/tools/unix-timestamp').then(mod => ({ default: mod.UnixTimestamp })),
    { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function UnixTimestampPage() {
    const t = useTranslations('UnixTimestamp')
    const tool = getToolById('unix-timestamp')
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {tool && (
                <ToolPageHeader title={t('title')} description={t('description')} icon={tool.icon} colorClass={tool.color} />
            )}
            <ToolComponent />
            <ToolGuide ns="UnixTimestamp" />
        </div>
    )
}
