import { getTranslations } from 'next-intl/server';
import { CsvEditor } from '@/components/tools/csv-editor';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('CsvEditor.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('CsvEditor.description'),
    };
}

export default function CsvEditorPage() {
    return (
        <div>
            <CsvEditor />
            <ToolGuide ns="CsvEditor" />
        </div>
    );
}
