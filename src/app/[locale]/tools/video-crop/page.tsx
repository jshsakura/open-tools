import { getTranslations, setRequestLocale } from "next-intl/server"
import { VideoCrop } from "@/components/tools/video-crop"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("VideoCrop.title"),
        description: t("VideoCrop.description"),
        path: "/tools/video-crop",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function VideoCropPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("VideoCrop.title"),
        description: tc("VideoCrop.description"),
        path: "/tools/video-crop",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <VideoCrop />
            <ToolGuide ns="VideoCrop" />
        </div>
    )
}
