"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"







const YoutubeThumbnail = dynamic(
    () => import('@/components/tools/youtube-thumbnail').then(mod => ({ default: mod.YoutubeThumbnail })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function YoutubeThumbnailPage() {
    const t = useTranslations('YoutubeThumbnail')
    const tool = getToolById('youtube-thumbnail');

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
            {tool && (
                <ToolPageHeader
                    title={t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                    description={t('description')}
                    icon={tool.icon}
                    colorClass={tool.color}
                    center
                />
            )}
        </div>

            <YoutubeThumbnail />
        </div>
    )
}
