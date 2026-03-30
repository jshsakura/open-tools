import { getTranslations } from 'next-intl/server';
import { IcoConverter } from '@/components/tools/ico-converter';
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'IcoConverter' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function IcoConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'IcoConverter' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="mb-12 space-y-4 text-center">
                <ToolPageHeader
                    title={t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                    description={t('description')}
                    toolId="ico-converter"
                    center
                />
            </div>

            <IcoConverter />
            <ToolGuide ns="IcoConverter" />
        </div>
    );
}
