import { getTranslations } from 'next-intl/server';
import { Base64Converter } from '@/components/tools/base64-converter';
import { ToolPageHeader } from "@/components/tool-page-header"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Base64Converter' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function Base64ConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Base64Converter' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4 text-center">
                <ToolPageHeader
                    title={t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                    description={t('description')}
                    toolId="base64-converter"
                    center
                />
            </div>

            <Base64Converter />
        </div>
    );
}
