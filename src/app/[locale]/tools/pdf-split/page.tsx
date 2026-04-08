import { PdfSplit } from "@/components/tools/pdf-split"
import { ToolGuide } from "@/components/tool-guide-section"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("PdfSplit.title"),
        description: t("PdfSplit.description"),
        path: "/tools/pdf-split",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function PdfSplitPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("PdfSplit.title"),
        description: tc("PdfSplit.description"),
        path: "/tools/pdf-split",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mx-auto max-w-5xl space-y-12">
                <PdfSplit />
                <ToolGuide ns="PdfSplit" />
            </div>
        </div>
    )
}
