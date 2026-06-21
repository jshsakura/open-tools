import { getTranslations, setRequestLocale } from "next-intl/server"
import { MarkdownTocGenerator } from "@/components/tools/markdown-toc-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("MarkdownTocGenerator.title"),
        description: t("MarkdownTocGenerator.description"),
        path: "/tools/markdown-toc-generator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function MarkdownTocGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("MarkdownTocGenerator.title"),
        description: tc("MarkdownTocGenerator.description"),
        path: "/tools/markdown-toc-generator",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <MarkdownTocGenerator />
            <ToolGuide ns="MarkdownTocGenerator" />
        </div>
    )
}
