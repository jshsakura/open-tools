import { getTranslations, setRequestLocale } from "next-intl/server"
import { GifToVideo } from "@/components/tools/gif-to-video"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("GifToVideo.title"),
        description: t("GifToVideo.description"),
        path: "/tools/gif-to-video",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function GifToVideoPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("GifToVideo.title"),
        description: tc("GifToVideo.description"),
        path: "/tools/gif-to-video",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <GifToVideo />
            <ToolGuide ns="GifToVideo" />
        </div>
    )
}
