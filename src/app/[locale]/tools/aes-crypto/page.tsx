import { useTranslations } from 'next-intl';
import { AesCrypto } from '@/components/tools/aes-crypto';
import { ToolGuide } from "@/components/tool-guide-section";

export const runtime = 'edge';

export default function AesEncryptPage() {
    const t = useTranslations('Catalog')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    {t('AesCrypto.title')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('AesCrypto.description')}
                </p>
            </div>
            <AesCrypto />
            <ToolGuide ns="AesCrypto" />
        </div>
    );
}
