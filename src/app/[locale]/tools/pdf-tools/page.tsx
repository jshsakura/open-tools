import { PdfTools } from "@/components/tools/pdf-tools"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PdfTools' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function PdfToolsPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <PdfTools />
        </div>
    )
}
