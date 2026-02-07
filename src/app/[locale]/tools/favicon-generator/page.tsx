import { getTranslations } from 'next-intl/server'
import { FaviconClientView } from "@/components/tools/favicon-client-view"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.FaviconGenerator' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function FaviconGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.FaviconGenerator' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    <span className="text-primary">{t('title')}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <FaviconClientView />
        </div>
    )
}
