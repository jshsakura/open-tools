import { getTranslations, setRequestLocale } from "next-intl/server"
import { BarcodeGenerator } from "@/components/tools/barcode-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("BarcodeGenerator.title"),
        description: t("BarcodeGenerator.description"),
        path: "/tools/barcode-generator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function BarcodeGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("BarcodeGenerator.title"),
        description: tc("BarcodeGenerator.description"),
        path: "/tools/barcode-generator",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <BarcodeGenerator />
            <ToolGuide ns="BarcodeGenerator" />
        </div>
    )
}
