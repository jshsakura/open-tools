import { getTranslations, setRequestLocale } from "next-intl/server";
import { KTools } from "@/components/tools/k-tools";
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("KSeries.title"),
        description: t("KSeries.description"),
        path: "/tools/k-series",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function KSeriesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'Catalog.KSeries' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("KSeries.title"),
        description: tc("KSeries.description"),
        path: "/tools/k-series",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl shadow-sm min-h-screen pt-24">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <h1 className="text-4xl font-black tracking-tight text-center mb-4">{t('title')}</h1>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">{t('description')}</p>
            <KTools />
            <ToolGuide ns="KTools" />
        </div>
    );
}
