import { getTranslations, setRequestLocale } from "next-intl/server"
import { ImagesToPpt } from "@/components/tools/images-to-ppt"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("ImagesToPpt.title"),
        description: t("ImagesToPpt.description"),
        path: "/tools/images-to-ppt",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function ImagesToPptPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("ImagesToPpt.title"),
        description: tc("ImagesToPpt.description"),
        path: "/tools/images-to-ppt",
        category: "MultimediaApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ImagesToPpt />
            <ToolGuide ns="ImagesToPpt" />
        </div>
    )
}
