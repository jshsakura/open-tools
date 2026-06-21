import { getTranslations, setRequestLocale } from "next-intl/server"
import { CssSpecificityCalculator } from "@/components/tools/css-specificity-calculator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("CssSpecificityCalculator.title"),
        description: t("CssSpecificityCalculator.description"),
        path: "/tools/css-specificity-calculator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function CssSpecificityCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("CssSpecificityCalculator.title"),
        description: tc("CssSpecificityCalculator.description"),
        path: "/tools/css-specificity-calculator",
        category: "DeveloperApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <CssSpecificityCalculator />
            <ToolGuide ns="CssSpecificityCalculator" />
        </div>
    )
}
