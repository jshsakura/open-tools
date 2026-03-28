import { getTranslations } from 'next-intl/server';
import { MarkdownToPdf } from '@/components/tools/markdown-to-pdf';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('MarkdownToPdf.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('MarkdownToPdf.description'),
    };
}

export default function MarkdownToPdfPage() {
    return (
        <div>
            <MarkdownToPdf />
            <ToolGuide ns="MarkdownToPdf" />
        </div>
    );
}
