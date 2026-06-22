import { getTranslations, setRequestLocale } from "next-intl/server"
import { VideoWatermark } from "@/components/tools/video-watermark"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VideoWatermark.title"),
        description: t("VideoWatermark.description"),
        path: "/tools/video-watermark",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoWatermarkPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VideoWatermark.title"),
        description: tc("VideoWatermark.description"),
        path: "/tools/video-watermark",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VideoWatermark />
            <ToolGuide ns="VideoWatermark" />
        </div>
    )
}
