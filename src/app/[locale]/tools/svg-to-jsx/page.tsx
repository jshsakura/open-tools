import { getTranslations } from 'next-intl/server';
import { SvgToJsxTool } from '@/components/tools/svg-to-jsx';
import { ToolGuide } from "@/components/tool-guide-section";

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
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="mb-12 space-y-4 text-center">
                <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-6xl">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-12">
                <SvgToJsxTool />
                <ToolGuide ns="SvgToJsx" />
            </div>
        </div>
    );
}
