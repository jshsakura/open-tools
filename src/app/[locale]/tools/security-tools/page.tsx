import { SecurityTools } from "@/components/tools/security-tools"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("SecurityTools.title"),
        description: t("SecurityTools.description"),
        path: "/tools/security-tools",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SecurityToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'Catalog.SecurityTools' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("SecurityTools.title"),
        description: tc("SecurityTools.description"),
        path: "/tools/security-tools",
        category: "SecurityApplication",
    });

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <div className="mb-12 space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    <span className="text-primary">{t('title')}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>
            <SecurityTools />
            <ToolGuide ns="SecurityTools" />
        </div>
    )
}
