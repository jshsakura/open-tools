import { getTranslations, setRequestLocale } from "next-intl/server"
import { NumberToWords } from "@/components/tools/number-to-words"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("NumberToWords.title"),
        description: t("NumberToWords.description"),
        path: "/tools/number-to-words",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function NumberToWordsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("NumberToWords.title"),
        description: tc("NumberToWords.description"),
        path: "/tools/number-to-words",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <NumberToWords />
            <ToolGuide ns="NumberToWords" />
        </div>
    )
}
