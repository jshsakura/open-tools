"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"

const MetaTagGenerator = dynamic(
    () => import('@/components/tools/meta-tag-generator').then(mod => ({ default: mod.MetaTagGenerator })),
    { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function MetaTagGeneratorPage() {
    const t = useTranslations('MetaTagGenerator')
    const tool = getToolById('meta-tag-generator')
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">{tool && (
            <ToolPageHeader title={t('title')} description={t('description')} icon={tool.icon} colorClass={tool.color} />
        )}
        <MetaTagGenerator />
        <ToolGuide ns="MetaTagGenerator" /></div>
    )
}
