import { TextTools } from "@/components/tools/text-tools"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'TextTools' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function TextToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'TextTools' });

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
            <TextTools />
        </div>
    )
}
