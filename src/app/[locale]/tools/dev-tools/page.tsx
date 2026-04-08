import { DevTools } from "@/components/tools/dev-tools"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { getTranslations , setRequestLocale} from "next-intl/server"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"
import { getToolById } from "@/lib/tools-catalog"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Catalog" });
    return createToolMetadata({
        locale,
        title: t("DevTools.title"),
        description: t("DevTools.description"),
        path: "/tools/dev-tools",
    })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function DevToolsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const tc = await getTranslations({ locale, namespace: "Catalog" });
    const t = await getTranslations({ locale, namespace: 'DevTools' });
    ;
    const jsonLd = createToolJsonLd({
        locale,
        title: tc("DevTools.title"),
        description: tc("DevTools.description"),
        path: "/tools/dev-tools",
        category: "DeveloperApplication",
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            <ToolPageHeader
                title={t('title')}
                description={t('description')}
                toolId="dev-tools"
            />
            <DevTools />
            <ToolGuide ns="DevTools" />
        </div>
    )
}
