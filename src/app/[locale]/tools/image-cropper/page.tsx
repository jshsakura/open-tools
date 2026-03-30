import { getTranslations } from 'next-intl/server';
import { ImageCropper } from '@/components/tools/image-cropper';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ImageCropper.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ImageCropper.description'),
    };
}

export default function ImageCropperPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ImageCropper />
            <ToolGuide ns="ImageCropper" />
        </div>
    );
}
