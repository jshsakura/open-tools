import { Basic3dViewer } from "@/components/tools/3d-viewer"
import { ToolGuide } from "@/components/tool-guide-section"
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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <Basic3dViewer />
            <ToolGuide ns="Basic3dViewer" />
        </div>
    )
}
