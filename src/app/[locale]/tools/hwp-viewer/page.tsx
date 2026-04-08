import { DocumentViewer } from "@/components/tools/hwp-viewer"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("HwpViewer.title"),
        description: t("HwpViewer.description"),
        path: "/tools/hwp-viewer",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function HwpViewerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'HwpViewer' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("HwpViewer.title"),
        description: tc("HwpViewer.description"),
        path: "/tools/hwp-viewer",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <header className="space-y-3 text-center">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">
                    {t('title')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t('description')}
                </p>
            </header>
            <DocumentViewer />
            <ToolGuide ns="HwpViewer" />
        </div>
    )
}
