import { BcryptGenerator } from "@/components/tools/bcrypt-generator"
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
        <div className="container mx-auto py-12 px-4">
            <BcryptGenerator />
        </div>
    )
}
