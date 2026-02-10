"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Wand2 } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"







const BackgroundRemover = dynamic(
    () => import("@/components/tools/background-remover").then(mod => ({ default: mod.BackgroundRemover })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function BackgroundRemoverPage() {
    const t = useTranslations('BackgroundRemover')
    const tool = getToolById('background-remover');

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

            <BackgroundRemover />
        </div>
    )
}
