import { getTranslations, setRequestLocale } from "next-intl/server"
import { BinaryTextConverter } from "@/components/tools/binary-text-converter"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("BinaryTextConverter.title"),
        description: t("BinaryTextConverter.description"),
        path: "/tools/binary-text-converter",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function BinaryTextConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("BinaryTextConverter.title"),
        description: tc("BinaryTextConverter.description"),
        path: "/tools/binary-text-converter",
        category: "DeveloperApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <BinaryTextConverter />
            <ToolGuide ns="BinaryTextConverter" />
        </div>
    )
}
