import { getTranslations, setRequestLocale } from "next-intl/server"
import { NeumorphismGenerator } from "@/components/tools/neumorphism-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("NeumorphismGenerator.title"),
        description: t("NeumorphismGenerator.description"),
        path: "/tools/neumorphism-generator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function NeumorphismGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("NeumorphismGenerator.title"),
        description: tc("NeumorphismGenerator.description"),
        path: "/tools/neumorphism-generator",
        category: "DesignApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <NeumorphismGenerator />
            <ToolGuide ns="NeumorphismGenerator" />
        </div>
    )
}
