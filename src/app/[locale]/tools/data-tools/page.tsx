import { DataTools } from "@/components/tools/data-tools"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DataTools' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function DataToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'DataTools' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
            <DataTools />
            <ToolGuide ns="DataTools" />
        </div>
    )
}
