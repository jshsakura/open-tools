"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"

const RobotsTxtGenerator = dynamic(
    () => import('@/components/tools/robots-txt-generator').then(mod => ({ default: mod.RobotsTxtGenerator })),
    { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function RobotsTxtGeneratorPage() {
    const t = useTranslations('RobotsTxtGenerator')
    const tool = getToolById('robots-txt-generator')
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {tool && (
                <ToolPageHeader title={t('title')} description={t('description')} icon={tool.icon} colorClass={tool.color} />
            )}
            <RobotsTxtGenerator />
            <ToolGuide ns="RobotsTxtGenerator" />
        </div>
    )
}
