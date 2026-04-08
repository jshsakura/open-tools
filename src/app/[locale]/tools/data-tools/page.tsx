import { DataTools } from "@/components/tools/data-tools"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("DataTools.title"),
        description: t("DataTools.description"),
        path: "/tools/data-tools",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function DataToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'DataTools' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("DataTools.title"),
        description: tc("DataTools.description"),
        path: "/tools/data-tools",
        category: "DeveloperApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>
            <DataTools />
            <ToolGuide ns="DataTools" />
        </div>
    )
}
