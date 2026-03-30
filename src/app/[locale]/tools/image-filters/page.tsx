import { getTranslations } from 'next-intl/server';
import { ImageFilters } from '@/components/tools/image-filters';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ImageFilters.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ImageFilters.description'),
    };
}

export default function ImageFiltersPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ImageFilters />
            <ToolGuide ns="ImageFilters" />
        </div>
    );
}
