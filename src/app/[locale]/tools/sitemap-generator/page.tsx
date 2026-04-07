import { getTranslations } from "next-intl/server"
import { ToolGuide } from "@/components/tool-guide-section"
import { ToolPageHeader } from "@/components/tool-page-header"
import { SitemapGenerator } from "@/components/tools/sitemap-generator"
import { getToolById } from "@/lib/tools-catalog"
import { createToolJsonLd, createToolMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })

  return createToolMetadata({
    locale,
    title: t("SitemapGenerator.title"),
    description: t("SitemapGenerator.description"),
    path: "/tools/sitemap-generator",
  })
}

export default async function SitemapGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Catalog" })
  const tool = getToolById("sitemap-generator")
  const jsonLd = createToolJsonLd({
    locale,
    title: t("SitemapGenerator.title"),
    description: t("SitemapGenerator.description"),
    path: "/tools/sitemap-generator",
    category: "DeveloperApplication",
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ToolPageHeader title={t("SitemapGenerator.title")} description={t("SitemapGenerator.description")} icon={tool?.icon} colorClass={tool?.color} />
      <SitemapGenerator />
      <ToolGuide ns="SitemapGenerator" />
    </div>
  )
}
