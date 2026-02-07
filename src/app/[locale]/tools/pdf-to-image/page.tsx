import { PdfToImage } from "@/components/tools/pdf-to-image"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PdfToImage' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function PdfToImagePage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <PdfToImage />
        </div>
    )
}
