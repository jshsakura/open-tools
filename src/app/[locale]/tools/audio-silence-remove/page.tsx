import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioSilenceRemove } from "@/components/tools/audio-silence-remove"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioSilenceRemove.title"),
        description: t("AudioSilenceRemove.description"),
        path: "/tools/audio-silence-remove",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioSilenceRemovePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioSilenceRemove.title"),
        description: tc("AudioSilenceRemove.description"),
        path: "/tools/audio-silence-remove",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioSilenceRemove />
            <ToolGuide ns="AudioSilenceRemove" />
        </div>
    )
}
