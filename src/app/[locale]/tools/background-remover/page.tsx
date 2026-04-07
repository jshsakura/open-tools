import { getTranslations } from 'next-intl/server'
import { BackgroundRemover } from "@/components/tools/background-remover"
import { getToolById } from "@/lib/tools-catalog"
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Catalog' })

    return createToolMetadata({
        locale,
        title: t('BackgroundRemover.title'),
        description: t('BackgroundRemover.description'),
        path: '/tools/background-remover',
    })
}

export default async function BackgroundRemoverPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Catalog' })
    const tool = getToolById('background-remover')
    const jsonLd = createToolJsonLd({
        locale,
        title: t('BackgroundRemover.title'),
        description: t('BackgroundRemover.description'),
        path: '/tools/background-remover',
        category: 'MultimediaApplication',
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4">
                {tool && (
                    <ToolPageHeader
                        title={t('BackgroundRemover.title')}
                        description={t('BackgroundRemover.description')}
                        icon={tool.icon}
                        colorClass={tool.color}
                        center
                    />
                )}
            </div>

            <BackgroundRemover />
            <ToolGuide ns="BackgroundRemover" />
        </div>
    )
}
