"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"

const ToolComponent = dynamic(
    () => import('@/components/tools/env-editor').then(mod => ({ default: mod.EnvEditorTool })),
    { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function ToolPage() {
    const t = useTranslations('EnvEditor')
    const tool = getToolById('env-editor')
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">{tool && (
            <ToolPageHeader title={t('title')} description={t('description')} icon={tool.icon} colorClass={tool.color} />
        )}
        <ToolComponent />
        <ToolGuide ns="EnvEditor" /></div>
    )
}
