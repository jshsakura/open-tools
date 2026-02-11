import { DevTools } from "@/components/tools/dev-tools"
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
        <div className="container mx-auto py-12 max-w-5xl">
            <ToolPageHeader
                title={t('title')}
                description={t('description')}
                toolId="dev-tools"
            />
            <DevTools />
        </div>
    )
}
