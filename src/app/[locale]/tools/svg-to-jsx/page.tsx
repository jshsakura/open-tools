import { getTranslations, setRequestLocale } from "next-intl/server";
import { SvgToJsxTool } from '@/components/tools/svg-to-jsx';
import { ToolGuide } from "@/components/tool-guide-section";
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("SvgToJsx.title"),
        description: t("SvgToJsx.description"),
        path: "/tools/svg-to-jsx",
    });
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SvgToJsxPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'Catalog.SvgToJsx' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("SvgToJsx.title"),
        description: tc("SvgToJsx.description"),
        path: "/tools/svg-to-jsx",
        category: "DeveloperApplication",
    });

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4 text-center">
                <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-6xl">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-12">
                <SvgToJsxTool />
                <ToolGuide ns="SvgToJsx" />
            </div>
        </div>
    );
}
