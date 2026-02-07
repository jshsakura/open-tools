import { Basic3dViewer } from "@/components/tools/3d-viewer"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Basic3dViewer' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function Basic3dViewerPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <Basic3dViewer />
        </div>
    )
}
