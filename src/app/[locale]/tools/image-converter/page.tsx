"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Image as ImageIcon } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"







const ImageConverter = dynamic(
    () => import('@/components/tools/image-converter').then(mod => ({ default: mod.ImageConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function ImageConverterPage() {
    const t = useTranslations('Catalog.ImageConverter')
    const tool = getToolById('image-converter');

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
                />
            )}
        </div>

            <ImageConverter />
        </div>
    )
}
