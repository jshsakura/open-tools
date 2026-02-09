import { DocumentViewer } from "@/components/tools/hwp-viewer"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HwpViewer' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default async function HwpViewerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'HwpViewer' })
    return (
        <div className="container mx-auto py-12 px-4 space-y-8">
            <header className="space-y-3 text-center">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">
                    {t('title')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('description')}
                </p>
            </header>
            <DocumentViewer />
        </div>
    )
}
