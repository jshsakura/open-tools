import { getTranslations, setRequestLocale } from "next-intl/server";
import { Base64Converter } from '@/components/tools/base64-converter';
import { ToolPageHeader } from "@/components/tool-page-header"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("Base64Converter.title"),
        description: t("Base64Converter.description"),
        path: "/tools/base64-converter",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function Base64ConverterPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'Base64Converter' });
    const tool = getToolById("base64-converter");
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("Base64Converter.title"),
        description: tc("Base64Converter.description"),
        path: "/tools/base64-converter",
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
                    toolId="base64-converter"
                    center
                />
            </div>

            <Base64Converter />
            <ToolGuide ns="Base64Converter" />
        </div>
    );
}
