import { getTranslations } from 'next-intl/server';
import { HashGenerator } from '@/components/tools/hash-generator';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'SecurityTools' });
    return {
        title: `${t('Hash.title')} - Open Tools`,
        description: t('Hash.description')
    }
}

export default function HashGeneratorPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <HashGenerator />
            <ToolGuide ns="HashGenerator" />
        </div>
    );
}
