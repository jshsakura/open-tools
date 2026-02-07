import { getTranslations } from "next-intl/server";
import { KTools } from "@/components/tools/k-tools";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Catalog.KSeries' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function KSeriesPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Catalog.KSeries' });

    return (
        <div className="container mx-auto py-12 px-4 shadow-sm min-h-screen pt-24">
            <h1 className="text-4xl font-black tracking-tight text-center mb-4">{t('title')}</h1>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">{t('description')}</p>
            <KTools />
        </div>
    );
}
