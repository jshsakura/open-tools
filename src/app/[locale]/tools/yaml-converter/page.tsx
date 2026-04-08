import { getTranslations, setRequestLocale } from "next-intl/server";
import { YamlConverter } from '@/components/tools/yaml-converter';
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("YamlConverter.title"),
        description: t("YamlConverter.description"),
        path: "/tools/yaml-converter",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function YamlConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'YamlConverter' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("YamlConverter.title"),
        description: tc("YamlConverter.description"),
        path: "/tools/yaml-converter",
        category: "DeveloperApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4 text-center">
                <ToolPageHeader
                    title={t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                    description={t('description')}
                    toolId="yaml-converter"
                    center
                />
            </div>

            <YamlConverter />
            <ToolGuide ns="YamlConverter" />
        </div>
    );
}
