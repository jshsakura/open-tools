import { BoxShadowGenerator } from "@/components/tools/box-shadow-generator"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("BoxShadowGenerator.title"),
        description: t("BoxShadowGenerator.description"),
        path: "/tools/box-shadow-generator",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function BoxShadowGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: "BoxShadowGenerator" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("BoxShadowGenerator.title"),
        description: tc("BoxShadowGenerator.description"),
        path: "/tools/box-shadow-generator",
        category: "DesignApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl font-black tracking-tighter sm:text-6xl text-foreground">
                    {t.rich('title', {
                        span: (chunks) => <span className="text-primary">{chunks}</span>
                    })}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    {t('description')}
                </p>
            </div>
            <BoxShadowGenerator />
            <ToolGuide ns="BoxShadowGenerator" />
        </div>
    )
}
