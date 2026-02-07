import { getTranslations } from 'next-intl/server';
import { UrlConverter } from '@/components/tools/url-converter';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('UrlConverter.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('UrlConverter.description'),
    };
}

export default function UrlConverterPage() {
    return <UrlConverter />;
}
