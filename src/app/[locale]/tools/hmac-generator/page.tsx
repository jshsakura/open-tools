import { HmacGenerator } from "@/components/tools/hmac-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HmacGenerator' });
    return {
        title: `${t('title')} - Open Tools`,
        description: t('description')
    }
}

export default function HmacGeneratorPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <HmacGenerator />
            <ToolGuide ns="HmacGenerator" />
        </div>
    )
}
