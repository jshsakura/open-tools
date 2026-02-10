"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { FileJson } from 'lucide-react'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"







const JsonYamlConverter = dynamic(
    () => import('@/components/tools/json-yaml-converter').then(mod => ({ default: mod.JsonYamlConverter })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function JsonYamlPage() {
    const t = useTranslations('JsonYaml')
    const tool = getToolById('json-yaml-converter');

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

            <JsonYamlConverter />
        </div>
    )
}
