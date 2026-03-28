import { getTranslations } from 'next-intl/server';
import { ImageWatermark } from '@/components/tools/image-watermark';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ImageWatermark.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ImageWatermark.description'),
    };
}

export default function ImageWatermarkPage() {
    return (
        <div>
            <ImageWatermark />
            <ToolGuide ns="ImageWatermark" />
        </div>
    );
}
