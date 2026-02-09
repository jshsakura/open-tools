import { getTranslations } from 'next-intl/server';
import { SvgToJsxTool } from '@/components/tools/svg-to-jsx';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.SvgToJsx' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    };
}

export default async function SvgToJsxPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Catalog.SvgToJsx' });

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4 text-center">
                <h1 className="text-4xl font-black tracking-tighter sm:text-6xl text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto text-center">
                    {t('description')}
                </p>
            </div>

            <SvgToJsxTool />
        </div>
    );
}
