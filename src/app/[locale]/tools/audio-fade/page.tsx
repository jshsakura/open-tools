import { getTranslations, setRequestLocale } from "next-intl/server"
import { AudioFade } from "@/components/tools/audio-fade"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("AudioFade.title"),
        description: t("AudioFade.description"),
        path: "/tools/audio-fade",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function AudioFadePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("AudioFade.title"),
        description: tc("AudioFade.description"),
        path: "/tools/audio-fade",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <AudioFade />
            <ToolGuide ns="AudioFade" />
        </div>
    )
}
