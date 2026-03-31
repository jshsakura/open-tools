import { PdfToImage } from "@/components/tools/pdf-to-image"
import { ToolGuide } from "@/components/tool-guide-section"
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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="mx-auto max-w-5xl space-y-12">
                <PdfToImage />
                <ToolGuide ns="PdfToImage" />
            </div>
        </div>
    )
}
