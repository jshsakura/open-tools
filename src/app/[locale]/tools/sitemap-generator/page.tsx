"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { getToolById } from "@/lib/tools-catalog"

const SitemapGenerator = dynamic(
    () => import('@/components/tools/sitemap-generator').then(mod => ({ default: mod.SitemapGenerator })),
    { loading: () => <ToolLoadingSkeleton />, ssr: false }
)

export default function SitemapGeneratorPage() {
    const t = useTranslations('SitemapGenerator')
    const tool = getToolById('sitemap-generator')
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {tool && (
                <ToolPageHeader title={t('title')} description={t('description')} icon={tool.icon} colorClass={tool.color} />
            )}
            <SitemapGenerator />
            <ToolGuide ns="SitemapGenerator" />
        </div>
    )
}
