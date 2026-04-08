import { TextTools } from "@/components/tools/text-tools"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("TextTools.title"),
        description: t("TextTools.description"),
        path: "/tools/text-tools",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function TextToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'TextTools' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("TextTools.title"),
        description: tc("TextTools.description"),
        path: "/tools/text-tools",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto py-12 px-4">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
            <TextTools />
            <ToolGuide ns="TextTools" />
        </div>
    )
}
