import { DevTools } from "@/components/tools/dev-tools"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DevTools' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function DevToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DevTools' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ToolPageHeader
                title={t('title')}
                description={t('description')}
                toolId="dev-tools"
            />
            <DevTools />
            <ToolGuide ns="DevTools" />
        </div>
    )
}
