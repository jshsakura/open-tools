import { SecurityTools } from "@/components/tools/security-tools"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.SecurityTools' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function SecurityToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.SecurityTools' });

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="mb-12 space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    <span className="text-primary">{t('title')}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>
            <SecurityTools />
        </div>
    )
}
