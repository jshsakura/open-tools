import { getTranslations, setRequestLocale } from "next-intl/server"
import { ReplaceAudio } from "@/components/tools/replace-audio"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("ReplaceAudio.title"),
        description: t("ReplaceAudio.description"),
        path: "/tools/replace-audio",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function ReplaceAudioPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ReplaceAudio.title"),
        description: tc("ReplaceAudio.description"),
        path: "/tools/replace-audio",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ReplaceAudio />
            <ToolGuide ns="ReplaceAudio" />
        </div>
    )
}
