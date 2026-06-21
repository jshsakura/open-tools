import { getTranslations, setRequestLocale } from "next-intl/server"
import { TextCleaner } from "@/components/tools/text-cleaner"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("TextCleaner.title"),
        description: t("TextCleaner.description"),
        path: "/tools/text-cleaner",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function TextCleanerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("TextCleaner.title"),
        description: tc("TextCleaner.description"),
        path: "/tools/text-cleaner",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <TextCleaner />
            <ToolGuide ns="TextCleaner" />
        </div>
    )
}
