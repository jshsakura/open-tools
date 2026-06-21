import { getTranslations, setRequestLocale } from "next-intl/server"
import { ChmodCalculator } from "@/components/tools/chmod-calculator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("ChmodCalculator.title"),
        description: t("ChmodCalculator.description"),
        path: "/tools/chmod-calculator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function ChmodCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ChmodCalculator.title"),
        description: tc("ChmodCalculator.description"),
        path: "/tools/chmod-calculator",
        category: "DeveloperApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ChmodCalculator />
            <ToolGuide ns="ChmodCalculator" />
        </div>
    )
}
