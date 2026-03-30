import { getTranslations } from 'next-intl/server';
import { ImageCompressor } from '@/components/tools/image-compressor';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ImageCompressor.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ImageCompressor.description'),
    };
}

export default function ImageCompressorPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ImageCompressor />
            <ToolGuide ns="ImageCompressor" />
        </div>
    );
}
