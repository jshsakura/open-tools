import { getTranslations, setRequestLocale } from "next-intl/server"
import { ColorBlindnessSimulator } from "@/components/tools/color-blindness-simulator"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("ColorBlindnessSimulator.title"),
        description: t("ColorBlindnessSimulator.description"),
        path: "/tools/color-blindness-simulator",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function ColorBlindnessSimulatorPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ColorBlindnessSimulator.title"),
        description: tc("ColorBlindnessSimulator.description"),
        path: "/tools/color-blindness-simulator",
        category: "DesignApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ColorBlindnessSimulator />
            <ToolGuide ns="ColorBlindnessSimulator" />
        </div>
    )
}
