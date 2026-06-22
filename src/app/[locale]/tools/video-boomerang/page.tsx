import { getTranslations, setRequestLocale } from "next-intl/server"
import { VideoBoomerang } from "@/components/tools/video-boomerang"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VideoBoomerang.title"),
        description: t("VideoBoomerang.description"),
        path: "/tools/video-boomerang",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoBoomerangPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VideoBoomerang.title"),
        description: tc("VideoBoomerang.description"),
        path: "/tools/video-boomerang",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VideoBoomerang />
            <ToolGuide ns="VideoBoomerang" />
        </div>
    )
}
