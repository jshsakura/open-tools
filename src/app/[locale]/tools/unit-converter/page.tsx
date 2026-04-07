import { getTranslations } from 'next-intl/server'
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { UnitConverter } from '@/components/tools/unit-converter'
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Catalog' })

    return createToolMetadata({
        locale,
        title: t('UnitConverter.title'),
        description: t('UnitConverter.description'),
        path: '/tools/unit-converter',
    })
}

export default async function UnitConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'UnitConverter' })
    const catT = await getTranslations({ locale, namespace: 'Catalog' })
    const tool = getToolById('unit-converter')
    const jsonLd = createToolJsonLd({
        locale,
        title: catT('UnitConverter.title'),
        description: catT('UnitConverter.description'),
        path: '/tools/unit-converter',
        category: 'UtilitiesApplication',
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            {tool && (
                <ToolPageHeader
                    title={t('title')}
                    description={t('description')}
                    icon={tool.icon}
                    colorClass={tool.color}
                />
            )}
            <UnitConverter />
            <ToolGuide ns="UnitConverter" />
        </div>
    )
}
