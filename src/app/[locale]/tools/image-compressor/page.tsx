import { getTranslations } from 'next-intl/server';
import { ImageCompressor } from '@/components/tools/image-compressor';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ImageCompressor.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ImageCompressor.description'),
    };
}

export default function ImageCompressorPage() {
    return <ImageCompressor />;
}
