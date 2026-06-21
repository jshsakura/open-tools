import { getTranslations, setRequestLocale } from "next-intl/server"
import { SignaturePad } from "@/components/tools/signature-pad"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Catalog" })
    return createToolMetadata({
        locale,
        title: t("SignaturePad.title"),
        description: t("SignaturePad.description"),
        path: "/tools/signature-pad",
    })
}

export function generateStaticParams() {
    return [{ locale: "ko" }, { locale: "en" }]
}

export default async function SignaturePadPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const tc = await getTranslations({ locale, namespace: "Catalog" })

    const jsonLd = createToolJsonLd({
        locale,
        title: tc("SignaturePad.title"),
        description: tc("SignaturePad.description"),
        path: "/tools/signature-pad",
        category: "UtilitiesApplication",
    })

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <SignaturePad />
            <ToolGuide ns="SignaturePad" />
        </div>
    )
}
