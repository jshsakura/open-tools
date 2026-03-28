import { getTranslations } from 'next-intl/server';
import { CollageMaker } from '@/components/tools/collage-maker';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('CollageMaker.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('CollageMaker.description'),
    };
}

export default function CollageMakerPage() {
    return (
        <div>
            <CollageMaker />
            <ToolGuide ns="CollageMaker" />
        </div>
    );
}
