import { getTranslations , setRequestLocale} from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SeoAnalyzerTool } from "@/components/tools/seo-analyzer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SeoAnalyzer.title"),
    description: t("SeoAnalyzer.description"),
    path: "/tools/seo-analyzer",
  })
}

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "en" }];
}

export default async function SeoAnalyzerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale);
    const tool = getToolById("seo-analyzer")
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const ui = await getTranslations({ locale, namespace: "SeoAnalyzer" })
    const jsonLd = createToolJsonLd({
    locale,
    title: catalog("SeoAnalyzer.title"),
    description: catalog("SeoAnalyzer.description"),
    path: "/tools/seo-analyzer",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {tool ? <ToolPageHeader title={ui("title")} description={ui("description")} toolId="seo-analyzer" /> : null}
      <SeoAnalyzerTool />
      <ToolGuide ns="SeoAnalyzer" />
    </div>
  )
}
