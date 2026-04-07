import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { HttpHeaderAnalyzerTool } from "@/components/tools/http-header-analyzer"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("HttpHeaderAnalyzer.title"),
    description: t("HttpHeaderAnalyzer.description"),
    path: "/tools/http-header-analyzer",
  })
}

export default async function HttpHeaderAnalyzerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "HttpHeaderAnalyzer" })
  const catalog = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("http-header-analyzer")
  const jsonLd = createToolJsonLd({
    locale,
    title: catalog("HttpHeaderAnalyzer.title"),
    description: catalog("HttpHeaderAnalyzer.description"),
    path: "/tools/http-header-analyzer",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {tool && <ToolPageHeader title={t("title")} description={t("description")} icon={tool.icon} colorClass={tool.color} />}
      <HttpHeaderAnalyzerTool />
      <ToolGuide ns="HttpHeaderAnalyzer" />
    </div>
  )
}
