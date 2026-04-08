import { CssGradientGenerator } from "@/components/tools/css-gradient-generator"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("GradientGenerator.title"),
        description: t("GradientGenerator.description"),
        path: "/tools/css-gradient-generator",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function CssGradientGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
  setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: "GradientGenerator" });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("GradientGenerator.title"),
        description: tc("GradientGenerator.description"),
        path: "/tools/css-gradient-generator",
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
            <CssGradientGenerator />
            <ToolGuide ns="GradientGenerator" />
        </div>
    )
}
