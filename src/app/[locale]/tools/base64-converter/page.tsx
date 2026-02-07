import { getTranslations } from 'next-intl/server';
import { Base64Converter } from '@/components/tools/base64-converter';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Base64Converter' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function Base64ConverterPage() {
    return <Base64Converter />;
}
