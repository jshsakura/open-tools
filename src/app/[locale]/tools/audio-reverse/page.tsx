import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioReverse } from "@/components/tools/audio-reverse"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioReverse.title"),
        description: t("AudioReverse.description"),
        path: "/tools/audio-reverse",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioReversePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioReverse.title"),
        description: tc("AudioReverse.description"),
        path: "/tools/audio-reverse",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioReverse />
            <ToolGuide ns="AudioReverse" />
        </div>
    )
}
