import { getTranslations, setRequestLocale } from "next-intl/server"
import { GpaCalculator } from "@/components/tools/gpa-calculator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("GpaCalculator.title"),
        description: t("GpaCalculator.description"),
        path: "/tools/gpa-calculator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function GpaCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("GpaCalculator.title"),
        description: tc("GpaCalculator.description"),
        path: "/tools/gpa-calculator",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <GpaCalculator />
            <ToolGuide ns="GpaCalculator" />
        </div>
    )
}
