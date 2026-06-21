import { getTranslations, setRequestLocale } from "next-intl/server"
import { HtpasswdGenerator } from "@/components/tools/htpasswd-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("HtpasswdGenerator.title"),
        description: t("HtpasswdGenerator.description"),
        path: "/tools/htpasswd-generator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function HtpasswdGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("HtpasswdGenerator.title"),
        description: tc("HtpasswdGenerator.description"),
        path: "/tools/htpasswd-generator",
        category: "SecurityApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <HtpasswdGenerator />
            <ToolGuide ns="HtpasswdGenerator" />
        </div>
    )
}
