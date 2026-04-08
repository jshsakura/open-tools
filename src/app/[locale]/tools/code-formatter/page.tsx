import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeFormatter } from '@/components/tools/code-formatter';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("CodeFormatter.title"),
        description: t("CodeFormatter.description"),
        path: "/tools/code-formatter",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function CodeFormatterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("CodeFormatter.title"),
        description: tc("CodeFormatter.description"),
        path: "/tools/code-formatter",
        category: "DeveloperApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <CodeFormatter />
            <ToolGuide ns="CodeFormatter" />
        </div>
    );
}
