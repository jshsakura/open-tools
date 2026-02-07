import { BoxShadowGenerator } from "@/components/tools/box-shadow-generator"
import { getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"

export async function generateMetadata() {
    const t = await getTranslations('BoxShadowGenerator')
    return {
        title: t('title'),
        description: t('description'),
    }
}

export default function BoxShadowGeneratorPage() {
    const t = useTranslations('BoxShadowGenerator')

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl font-black tracking-tighter sm:text-6xl text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <BoxShadowGenerator />
        </div>
    )
}
