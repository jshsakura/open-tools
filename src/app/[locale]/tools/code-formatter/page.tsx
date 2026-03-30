import { getTranslations } from 'next-intl/server';
import { CodeFormatter } from '@/components/tools/code-formatter';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('CodeFormatter.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('CodeFormatter.description'),
    };
}

export default function CodeFormatterPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <CodeFormatter />
            <ToolGuide ns="CodeFormatter" />
        </div>
    );
}
