import { RsaGenerator } from "@/components/tools/rsa-generator"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("RsaGenerator.title"),
        description: t("RsaGenerator.description"),
        path: "/tools/rsa-generator",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function RsaGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("RsaGenerator.title"),
        description: tc("RsaGenerator.description"),
        path: "/tools/rsa-generator",
        category: "SecurityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <RsaGenerator />
            <ToolGuide ns="RsaGenerator" />
        </div>
    )
}
