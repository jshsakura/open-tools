"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from "next-intl"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"







const BannerGeneratorTool = dynamic(
    () => import("@/components/tools/banner-generator").then(mod => ({ default: mod.BannerGeneratorTool })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function BannerGeneratorPage() {
    const t = useTranslations('Catalog')
    const tool = getToolById('banner-generator');

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl"><div className="mb-12 space-y-4">
        {tool && (
            <ToolPageHeader
                title={t.rich('BannerGenerator.title', {
                    span: (chunks) => <span className="text-primary">{chunks}</span>
                })}
                description={t('BannerGenerator.description')}
                icon={tool.icon}
                colorClass={tool.color}
            />
        )}
                </div>
        
        <BannerGeneratorTool />
        <ToolGuide ns="BannerGenerator" /></div>
    )
}
