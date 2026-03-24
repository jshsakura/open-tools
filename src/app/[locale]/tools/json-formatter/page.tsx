"use client"

import dynamic from 'next/dynamic'
import { useTranslations } from "next-intl"
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"

const JsonFormatterTool = dynamic(
    () => import("@/components/tools/json-formatter").then(mod => ({ default: mod.JsonFormatterTool })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function JsonFormatterPage() {
    const t = useTranslations('Catalog')
    const tool = getToolById('json-formatter');

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="mb-12 space-y-4">
                {tool && (
                    <ToolPageHeader
                        title={t.rich('JsonFormatter.title', {
                            span: (chunks) => <span className="text-primary">{chunks}</span>
                        })}
                        description={t('JsonFormatter.description')}
                        icon={tool.icon}
                        colorClass={tool.color}
                    />
                )}
            </div>

            <JsonFormatterTool />
        </div>
    )
}
