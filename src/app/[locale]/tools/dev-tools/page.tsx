import { DevTools } from "@/components/tools/dev-tools"
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
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
            <DevTools />
        </div>
    )
}
