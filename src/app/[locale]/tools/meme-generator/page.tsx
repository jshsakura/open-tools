import { getTranslations } from 'next-intl/server';
import { MemeGenerator } from '@/components/tools/meme-generator';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('MemeGenerator.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('MemeGenerator.description'),
    };
}

export default function MemeGeneratorPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <MemeGenerator />
            <ToolGuide ns="MemeGenerator" />
        </div>
    );
}
