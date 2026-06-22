import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioMerger } from "@/components/tools/audio-merger"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioMerger.title"),
        description: t("AudioMerger.description"),
        path: "/tools/audio-merger",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioMergerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioMerger.title"),
        description: tc("AudioMerger.description"),
        path: "/tools/audio-merger",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioMerger />
            <ToolGuide ns="AudioMerger" />
        </div>
    )
}
