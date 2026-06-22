import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioVolume } from "@/components/tools/audio-volume"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioVolume.title"),
        description: t("AudioVolume.description"),
        path: "/tools/audio-volume",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioVolumePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioVolume.title"),
        description: tc("AudioVolume.description"),
        path: "/tools/audio-volume",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioVolume />
            <ToolGuide ns="AudioVolume" />
        </div>
    )
}
