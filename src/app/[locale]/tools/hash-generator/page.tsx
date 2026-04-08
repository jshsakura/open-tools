import { getTranslations, setRequestLocale } from "next-intl/server";
import { HashGenerator } from '@/components/tools/hash-generator';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("HashGenerator.title"),
        description: t("HashGenerator.description"),
        path: "/tools/hash-generator",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function HashGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("HashGenerator.title"),
        description: tc("HashGenerator.description"),
        path: "/tools/hash-generator",
        category: "SecurityApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <HashGenerator />
            <ToolGuide ns="HashGenerator" />
        </div>
    );
}
