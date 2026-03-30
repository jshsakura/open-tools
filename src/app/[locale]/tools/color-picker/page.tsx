import { getTranslations } from 'next-intl/server';
import { ColorPicker } from '@/components/tools/color-picker';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('ColorPicker.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('ColorPicker.description'),
    };
}

export default function ColorPickerPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <ColorPicker />
            <ToolGuide ns="ColorPicker" />
        </div>
    );
}
