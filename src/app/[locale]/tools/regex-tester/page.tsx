"use client"


import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { ToolLoadingSkeleton } from "@/components/tool-loader"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getToolById } from "@/lib/tools-catalog"



const RegexTester = dynamic(
    () => import('@/components/tools/regex-tester').then(mod => ({ default: mod.RegexTester })),
    {
        loading: () => <ToolLoadingSkeleton />,
        ssr: false
    }
)

export default function RegexTesterPage() {
    const t = useTranslations('RegexTester')
    const tool = getToolById('regex-tester');

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                {tool && (
                    <ToolPageHeader
                        title={t('title')}
                        description={t('description')}
                        icon={tool.icon}
                        colorClass={tool.color}
                    />
                )}
            </div>
            <RegexTester />
        </div>
    )
}
