import { getTranslations, setRequestLocale } from "next-intl/server"
import { FlexboxGenerator } from "@/components/tools/flexbox-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("FlexboxGenerator.title"),
        description: t("FlexboxGenerator.description"),
        path: "/tools/flexbox-generator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function FlexboxGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("FlexboxGenerator.title"),
        description: tc("FlexboxGenerator.description"),
        path: "/tools/flexbox-generator",
        category: "DesignApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <FlexboxGenerator />
            <ToolGuide ns="FlexboxGenerator" />
        </div>
    )
}
