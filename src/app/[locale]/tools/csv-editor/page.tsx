import { getTranslations, setRequestLocale } from "next-intl/server";
import { CsvEditor } from '@/components/tools/csv-editor';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("CsvEditor.title"),
        description: t("CsvEditor.description"),
        path: "/tools/csv-editor",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function CsvEditorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("CsvEditor.title"),
        description: tc("CsvEditor.description"),
        path: "/tools/csv-editor",
        category: "UtilityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <CsvEditor />
            <ToolGuide ns="CsvEditor" />
        </div>
    );
}
