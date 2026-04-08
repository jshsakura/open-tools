import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarkdownToPdf } from '@/components/tools/markdown-to-pdf';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("MarkdownToPdf.title"),
        description: t("MarkdownToPdf.description"),
        path: "/tools/markdown-to-pdf",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function MarkdownToPdfPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("MarkdownToPdf.title"),
        description: tc("MarkdownToPdf.description"),
        path: "/tools/markdown-to-pdf",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <MarkdownToPdf />
            <ToolGuide ns="MarkdownToPdf" />
        </div>
    );
}
