import { PdfSplit } from "@/components/tools/pdf-split"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PdfSplit' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function PdfSplitPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <PdfSplit />
        </div>
    )
}
