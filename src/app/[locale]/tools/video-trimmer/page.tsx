import { getTranslations, setRequestLocale } from "next-intl/server"
import { VideoTrimmer } from "@/components/tools/video-trimmer"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VideoTrimmer.title"),
        description: t("VideoTrimmer.description"),
        path: "/tools/video-trimmer",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoTrimmerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VideoTrimmer.title"),
        description: tc("VideoTrimmer.description"),
        path: "/tools/video-trimmer",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VideoTrimmer />
            <ToolGuide ns="VideoTrimmer" />
        </div>
    )
}
