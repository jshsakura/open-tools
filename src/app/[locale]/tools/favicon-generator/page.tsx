import { setRequestLocale, getTranslations } from 'next-intl/server'
import { FaviconClientView } from "@/components/tools/favicon-client-view"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("FaviconGenerator.title"),
        description: t("FaviconGenerator.description"),
        path: "/tools/favicon-generator",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function FaviconGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'Catalog.FaviconGenerator' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("FaviconGenerator.title"),
        description: tc("FaviconGenerator.description"),
        path: "/tools/favicon-generator",
        category: "DesignApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    <span className="text-primary">{t('title')}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>

            <FaviconClientView />
            <ToolGuide ns="FaviconGenerator" />
        </div>
    )
}
