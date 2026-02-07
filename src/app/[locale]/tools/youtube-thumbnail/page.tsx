"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"

const YoutubeThumbnail = dynamic(
    () => import('@/components/tools/youtube-thumbnail').then(mod => ({ default: mod.YoutubeThumbnail })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function YoutubeThumbnailPage() {
    const t = useTranslations('YoutubeThumbnail')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <YoutubeThumbnail />
        </div>
    )
}
