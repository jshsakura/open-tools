import { getTranslations } from 'next-intl/server';
import { AesCrypto } from '@/components/tools/aes-crypto';
import { ToolGuide } from "@/components/tool-guide-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return {
        title: `${t('AesCrypto.title')} | ${t('Hero.title_1')} ${t('Hero.title_2')}`,
        description: t('AesCrypto.description'),
    };
}

export default function AesCryptoPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <AesCrypto />
            <ToolGuide ns="AesCrypto" />
        </div>
    );
}
