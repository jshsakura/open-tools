import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioTrimmer } from "@/components/tools/audio-trimmer"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioTrimmer.title"),
        description: t("AudioTrimmer.description"),
        path: "/tools/audio-trimmer",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioTrimmerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioTrimmer.title"),
        description: tc("AudioTrimmer.description"),
        path: "/tools/audio-trimmer",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioTrimmer />
            <ToolGuide ns="AudioTrimmer" />
        </div>
    )
}
