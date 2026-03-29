import { getTranslations } from 'next-intl/server';
import { UrlConverter } from '@/components/tools/url-converter';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('UrlConverter.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('UrlConverter.description'),
    };
}

export default function UrlConverterPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <UrlConverter />
            <ToolGuide ns="UrlConverter" />
        </div>
    );
}
