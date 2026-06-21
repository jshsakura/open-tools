import { getTranslations, setRequestLocale } from "next-intl/server"
import { VideoReverse } from "@/components/tools/video-reverse"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VideoReverse.title"),
        description: t("VideoReverse.description"),
        path: "/tools/video-reverse",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoReversePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VideoReverse.title"),
        description: tc("VideoReverse.description"),
        path: "/tools/video-reverse",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VideoReverse />
            <ToolGuide ns="VideoReverse" />
        </div>
    )
}
