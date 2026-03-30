import { getTranslations } from 'next-intl/server';
import { ImageEraser } from '@/components/tools/image-eraser';
import { ToolGuide } from '@/components/tool-guide-section'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('description'),
    }
}

export default function ImageEraserPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ImageEraser />
            <ToolGuide ns="ImageEraser" />
        </div>
    )
}
