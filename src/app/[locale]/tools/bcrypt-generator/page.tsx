import { BcryptGenerator } from "@/components/tools/bcrypt-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'SecurityTools' });
    return {
        title: `${t('BCrypt.title')} - Open Tools`,
        description: t('BCrypt.description')
    }
}

export default function BcryptGeneratorPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <BcryptGenerator />
            <ToolGuide ns="BcryptGenerator" />
        </div>
    )
}
