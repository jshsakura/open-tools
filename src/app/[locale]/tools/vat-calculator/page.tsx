import { getTranslations, setRequestLocale } from "next-intl/server"
import { VatCalculator } from "@/components/tools/vat-calculator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VatCalculator.title"),
        description: t("VatCalculator.description"),
        path: "/tools/vat-calculator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VatCalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VatCalculator.title"),
        description: tc("VatCalculator.description"),
        path: "/tools/vat-calculator",
        category: "FinanceApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VatCalculator />
            <ToolGuide ns="VatCalculator" />
        </div>
    )
}
